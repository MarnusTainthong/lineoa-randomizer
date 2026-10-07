import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { DIRECTED_RULE_TYPES, EVENT_STATUS, type ParticipantView } from '@line-oa-randomizer/shared';
import { DomainError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FeasibilityService } from '../feasibility/feasibility.service';
import { toParticipantView } from '../events/events.service';

const MAX_PARTICIPANTS_PER_EVENT = 200;

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventAccess: EventAccessService,
    private readonly feasibilityService: FeasibilityService,
  ) {}

  async list(eventId: string, userId: string): Promise<ParticipantView[]> {
    const { event } = await this.eventAccess.requireMembership(eventId, userId);
    const participants = await this.prisma.participant.findMany({
      where: { eventId },
      include: { user: true },
      orderBy: { displayName: 'asc' },
    });
    return participants.map((participant) => toParticipantView(participant, event, userId));
  }

  /** Organizer adds guests (people without LINE) by name. Duplicated names are ignored. */
  async addGuests(eventId: string, userId: string, names: string[]): Promise<ParticipantView[]> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    if (event.status !== EVENT_STATUS.OPEN) {
      throw new DomainError('EVENT_NOT_OPEN', 'จับสลากไปแล้ว เพิ่มคนไม่ได้');
    }

    const cleanedNames = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
    const existingCount = await this.prisma.participant.count({ where: { eventId } });
    if (existingCount + cleanedNames.length > MAX_PARTICIPANTS_PER_EVENT) {
      throw new DomainError('TOO_MANY_PARTICIPANTS', `เพิ่มได้ไม่เกิน ${MAX_PARTICIPANTS_PER_EVENT} คนต่อห้อง`);
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.participant.createMany({
        data: cleanedNames.map((displayName) => ({ eventId, displayName, addedById: userId })),
      });
      await this.feasibilityService.recompute(eventId, transaction);
    });
    return this.list(eventId, userId);
  }

  async remove(eventId: string, userId: string, participantId: string): Promise<void> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    if (event.status !== EVENT_STATUS.OPEN) {
      throw new DomainError('EVENT_NOT_OPEN', 'จับสลากไปแล้ว ลบคนไม่ได้');
    }

    const participant = await this.prisma.participant.findFirst({ where: { id: participantId, eventId } });
    if (!participant) throw new NotFoundException('ไม่พบผู้เข้าร่วม');
    if (participant.userId === event.organizerId) {
      throw new DomainError('CANNOT_REMOVE_ORGANIZER', 'ลบผู้จัดออกจากห้องไม่ได้');
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.participant.delete({ where: { id: participantId } });
      await this.dropParticipantFromRules(eventId, participantId, transaction);
      await this.feasibilityService.recompute(eventId, transaction);
    });
  }

  /** Rules that mention a removed person are trimmed; rules left with fewer than 2 people go away. */
  private async dropParticipantFromRules(
    eventId: string,
    participantId: string,
    transaction: Prisma.TransactionClient,
  ): Promise<void> {
    const rules = await transaction.rule.findMany({
      where: { eventId, participantIds: { has: participantId } },
    });
    for (const rule of rules) {
      const remainingIds = rule.participantIds.filter((id) => id !== participantId);
      // A directed pair loses its meaning when either side is gone.
      const isDirected = DIRECTED_RULE_TYPES.includes(rule.type);
      if (remainingIds.length < 2 || isDirected) {
        await transaction.rule.delete({ where: { id: rule.id } });
      } else {
        await transaction.rule.update({ where: { id: rule.id }, data: { participantIds: remainingIds } });
      }
    }
  }
}
