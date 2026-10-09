import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { Event, Participant, User } from '@prisma/client';
import {
  EVENT_STATUS,
  isInviteCode,
  normalizeInviteCode,
  type EventDetail,
  type EventSummary,
  type InvitePreview,
  type ParticipantView,
} from '@line-oa-randomizer/shared';
import { createInviteCode } from './invite-code';
import { DomainError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FeasibilityService } from '../feasibility/feasibility.service';
import type { CreateEventDto, UpdateEventDto } from './dto/event.dto';

type ParticipantWithUser = Participant & { user: User | null };

export function toParticipantView(
  participant: ParticipantWithUser,
  event: Pick<Event, 'organizerId'>,
  currentUserId: string,
): ParticipantView {
  return {
    id: participant.id,
    displayName: participant.displayName,
    pictureUrl: participant.user?.pictureUrl ?? null,
    isGuest: participant.userId === null,
    isMe: participant.userId === currentUserId,
    isOrganizer: participant.userId === event.organizerId,
  };
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventAccess: EventAccessService,
    private readonly feasibilityService: FeasibilityService,
  ) {}

  async create(userId: string, dto: CreateEventDto): Promise<EventDetail> {
    const organizer = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const event = await this.prisma.$transaction(async (transaction) => {
          const createdEvent = await transaction.event.create({
            data: {
              name: dto.name.trim(),
              description: dto.description?.trim() || null,
              budget: dto.budget ?? null,
              exchangeDate: dto.exchangeDate ? new Date(dto.exchangeDate) : null,
              allowViewAllResults: dto.allowViewAllResults ?? false,
              inviteCode: createInviteCode(),
              organizerId: userId,
              // The organizer takes part like anyone else.
              participants: { create: { userId, displayName: organizer.displayName } },
            },
          });
          await transaction.auditLog.create({
            data: { eventId: createdEvent.id, actorId: userId, action: 'EVENT_CREATED' },
          });
          await this.feasibilityService.recompute(createdEvent.id, transaction);
          return createdEvent;
        });
        return this.getDetail(event.id, userId);
      } catch (error) {
        if (!isInviteCodeConflict(error) || attempt === 4) throw error;
      }
    }
    throw new Error('could not allocate an invite code');
  }

  async list(userId: string, scope: 'organized' | 'joined'): Promise<EventSummary[]> {
    const events = await this.prisma.event.findMany({
      where:
        scope === 'organized'
          ? {
              organizerId: userId,
              // Older closes wiped people and rounds, then hid the room. Keep those
              // empty shells out of the list. A closed room that still has people
              // or a draw stays, so its results can be opened.
              OR: [
                { status: { not: EVENT_STATUS.CLOSED } },
                { participants: { some: {} } },
                { drawRounds: { some: {} } },
              ],
            }
          : { participants: { some: { userId } } },
      include: { participants: { select: { userId: true, lastSeenDrawVersion: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => {
      const myParticipant = event.participants.find((participant) => participant.userId === userId);
      const isOrganizer = event.organizerId === userId;
      return {
        id: event.id,
        name: event.name,
        status: event.status,
        budget: event.budget,
        exchangeDate: event.exchangeDate?.toISOString() ?? null,
        currentDrawVersion: event.currentDrawVersion,
        participantCount: event.participants.length,
        inviteCode: event.inviteCode,
        isOrganizer,
        hasNewDraw:
          !!myParticipant &&
          myParticipant.lastSeenDrawVersion > 0 &&
          myParticipant.lastSeenDrawVersion < event.currentDrawVersion,
        feasibility: isOrganizer ? event.feasibility : null,
      };
    });
  }

  async getDetail(eventId: string, userId: string): Promise<EventDetail> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: { include: { user: true }, orderBy: { displayName: 'asc' } } },
    });
    const isOrganizer = event?.organizerId === userId;
    const isParticipant = event?.participants.some((participant) => participant.userId === userId);
    if (!event || (!isOrganizer && !isParticipant)) throw new NotFoundException('ไม่พบห้องนี้');

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      budget: event.budget,
      exchangeDate: event.exchangeDate?.toISOString() ?? null,
      inviteCode: event.inviteCode,
      status: event.status,
      allowViewAllResults: event.allowViewAllResults,
      currentDrawVersion: event.currentDrawVersion,
      isOrganizer,
      // Only the organizer sees why a draw is blocked.
      feasibility: isOrganizer ? event.feasibility : null,
      feasibilityReason: isOrganizer ? event.feasibilityReason : null,
      participants: event.participants.map((participant) =>
        toParticipantView(participant, event, userId),
      ),
    };
  }

  async update(eventId: string, userId: string, dto: UpdateEventDto): Promise<EventDetail> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    if (event.status === EVENT_STATUS.CLOSED) {
      throw new DomainError('EVENT_CLOSED', 'ห้องนี้ปิดแล้ว');
    }

    if (dto.status === EVENT_STATUS.CLOSED) {
      await this.closeEvent(eventId, userId);
      return this.getDetail(eventId, userId);
    }

    await this.prisma.$transaction([
      this.prisma.event.update({
        where: { id: eventId },
        data: {
          name: dto.name?.trim(),
          description: dto.description === undefined ? undefined : dto.description.trim() || null,
          budget: dto.budget,
          exchangeDate: dto.exchangeDate ? new Date(dto.exchangeDate) : undefined,
          allowViewAllResults: dto.allowViewAllResults,
        },
      }),
      ...(dto.allowViewAllResults !== undefined && dto.allowViewAllResults !== event.allowViewAllResults
        ? [
            this.prisma.auditLog.create({
              data: { eventId, actorId: userId, action: 'SETTING_CHANGED' },
            }),
          ]
        : []),
    ]);
    return this.getDetail(eventId, userId);
  }

  async remove(eventId: string, userId: string): Promise<void> {
    await this.eventAccess.requireOrganizedEvent(eventId, userId);
    await this.prisma.$transaction([
      this.prisma.auditLog.deleteMany({ where: { eventId } }),
      this.prisma.event.delete({ where: { id: eventId } }),
    ]);
  }

  async previewInvite(inviteCode: string, userId: string): Promise<InvitePreview> {
    const event = await this.prisma.event.findUnique({
      where: { inviteCode: this.parseInviteCode(inviteCode) },
      include: { participants: { select: { userId: true } } },
    });
    if (!event || event.status === EVENT_STATUS.CLOSED) throw new NotFoundException('ไม่พบห้องนี้');
    return {
      eventId: event.id,
      name: event.name,
      status: event.status,
      isAlreadyJoined: event.participants.some((participant) => participant.userId === userId),
    };
  }

  async join(inviteCode: string, userId: string): Promise<{ eventId: string }> {
    const event = await this.prisma.event.findUnique({
      where: { inviteCode: this.parseInviteCode(inviteCode) },
    });
    if (!event || event.status === EVENT_STATUS.CLOSED) throw new NotFoundException('ไม่พบห้องนี้');

    const existingParticipant = await this.prisma.participant.findUnique({
      where: { eventId_userId: { eventId: event.id, userId } },
    });
    if (existingParticipant) return { eventId: event.id };

    if (event.status !== EVENT_STATUS.OPEN) {
      throw new DomainError('EVENT_NOT_OPEN', 'จับสลากไปแล้ว เข้าร่วมเพิ่มไม่ได้');
    }
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await this.prisma.$transaction(async (transaction) => {
      await transaction.participant.create({
        data: { eventId: event.id, userId, displayName: user.displayName },
      });
      await this.feasibilityService.recompute(event.id, transaction);
    });
    return { eventId: event.id };
  }

  /** Letters and digits only, six characters, uppercase. */
  private parseInviteCode(inviteCode: string): string {
    const code = normalizeInviteCode(inviteCode);
    if (!isInviteCode(code)) {
      throw new DomainError(
        'INVALID_INVITE_CODE',
        'รหัสห้องต้องเป็นตัวอักษรหรือตัวเลข 6 ตัว',
        HttpStatus.BAD_REQUEST,
      );
    }
    return code;
  }

  /** Closing locks edits. People, rules, and every draw round stay so results can still be opened. */
  private async closeEvent(eventId: string, userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.event.update({ where: { id: eventId }, data: { status: EVENT_STATUS.CLOSED } }),
      this.prisma.auditLog.create({ data: { eventId, actorId: userId, action: 'EVENT_CLOSED' } }),
    ]);
  }
}

function isInviteCodeConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
