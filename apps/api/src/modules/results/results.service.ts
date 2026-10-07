import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Participant } from '@prisma/client';
import {
  EVENT_STATUS,
  type MyResult,
  type ResultHistoryEntry,
  type RoundResults,
} from '@secret-santa/shared';
import { DomainError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';

function hasNewDraw(participant: Participant, currentDrawVersion: number): boolean {
  // Only people who already saw an earlier round get the "re-drawn" banner.
  return participant.lastSeenDrawVersion > 0 && participant.lastSeenDrawVersion < currentDrawVersion;
}

/**
 * Every read here enforces visibility: own result, guests the organizer added,
 * or everyone's when the organizer enabled allowViewAllResults. Never log results.
 */
@Injectable()
export class ResultsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventAccess: EventAccessService,
  ) {}

  async getMyResult(eventId: string, userId: string): Promise<MyResult> {
    const { event, participant } = await this.eventAccess.requireMembership(eventId, userId);

    const base = {
      eventId: event.id,
      eventName: event.name,
      budget: event.budget,
      exchangeDate: event.exchangeDate?.toISOString() ?? null,
      status: event.status,
      allowViewAllResults: event.allowViewAllResults,
      drawVersion: event.currentDrawVersion,
      hasNewDraw: hasNewDraw(participant, event.currentDrawVersion),
      hasOpenedCurrent:
        event.currentDrawVersion > 0 && participant.lastSeenDrawVersion === event.currentDrawVersion,
    };
    if (event.currentDrawVersion === 0) return { ...base, drawnAt: null, receiverName: null };

    const [round, assignment] = await Promise.all([
      this.prisma.drawRound.findUnique({
        where: { eventId_version: { eventId, version: event.currentDrawVersion } },
      }),
      this.prisma.assignment.findUnique({
        where: {
          eventId_giverId_drawVersion: {
            eventId,
            giverId: participant.id,
            drawVersion: event.currentDrawVersion,
          },
        },
      }),
    ]);
    const receiver = assignment
      ? await this.prisma.participant.findUnique({ where: { id: assignment.receiverId } })
      : null;

    return {
      ...base,
      drawnAt: round?.drawnAt.toISOString() ?? null,
      receiverName: receiver?.displayName ?? null,
    };
  }

  async getMyHistory(eventId: string, userId: string): Promise<ResultHistoryEntry[]> {
    const { event, participant } = await this.eventAccess.requireMembership(eventId, userId);

    // Only rounds this person took part in exist as their assignments.
    const assignments = await this.prisma.assignment.findMany({
      where: { eventId, giverId: participant.id },
      orderBy: { drawVersion: 'desc' },
    });
    const [rounds, receivers] = await Promise.all([
      this.prisma.drawRound.findMany({ where: { eventId } }),
      this.prisma.participant.findMany({
        where: { id: { in: assignments.map((assignment) => assignment.receiverId) } },
      }),
    ]);
    const drawnAtByVersion = new Map(rounds.map((round) => [round.version, round.drawnAt]));
    const receiverNameById = new Map(receivers.map((receiver) => [receiver.id, receiver.displayName]));

    return assignments.map((assignment) => ({
      drawVersion: assignment.drawVersion,
      drawnAt: (drawnAtByVersion.get(assignment.drawVersion) ?? new Date(0)).toISOString(),
      receiverName: receiverNameById.get(assignment.receiverId) ?? '',
      isCurrent: assignment.drawVersion === event.currentDrawVersion,
    }));
  }

  async acknowledgeLatestDraw(eventId: string, userId: string): Promise<void> {
    const { event, participant } = await this.eventAccess.requireMembership(eventId, userId);
    await this.prisma.participant.update({
      where: { id: participant.id },
      data: { lastSeenDrawVersion: event.currentDrawVersion },
    });
  }

  /** Organizer only: results of guests (people without LINE) this organizer added. */
  async getGuestResults(eventId: string, userId: string, version?: number): Promise<RoundResults> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    const guests = await this.prisma.participant.findMany({
      where: { eventId, userId: null, addedById: userId },
    });
    return this.buildRoundResults(event, version, new Set(guests.map((guest) => guest.id)));
  }

  /** Only when the organizer turned on allowViewAllResults. */
  async getAllResults(eventId: string, userId: string, version?: number): Promise<RoundResults> {
    const { event } = await this.eventAccess.requireMembership(eventId, userId);
    if (!event.allowViewAllResults) {
      throw new ForbiddenException('ผู้จัดไม่ได้เปิดให้ดูผลของทุกคน');
    }
    return this.buildRoundResults(event, version);
  }

  private async buildRoundResults(
    event: { id: string; status: string; currentDrawVersion: number },
    requestedVersion: number | undefined,
    onlyGiverIds?: Set<string>,
  ): Promise<RoundResults> {
    if (event.currentDrawVersion === 0 || event.status === EVENT_STATUS.OPEN) {
      throw new DomainError('NOT_DRAWN_YET', 'ยังไม่ได้จับสลาก');
    }
    const drawVersion = requestedVersion ?? event.currentDrawVersion;
    if (drawVersion < 1 || drawVersion > event.currentDrawVersion) {
      throw new DomainError('UNKNOWN_DRAW_VERSION', 'ไม่มีรอบการจับสลากนี้', 404);
    }

    const [round, assignments, participants] = await Promise.all([
      this.prisma.drawRound.findUnique({
        where: { eventId_version: { eventId: event.id, version: drawVersion } },
      }),
      this.prisma.assignment.findMany({ where: { eventId: event.id, drawVersion } }),
      this.prisma.participant.findMany({ where: { eventId: event.id } }),
    ]);
    const nameById = new Map(participants.map((participant) => [participant.id, participant.displayName]));

    const rows = assignments
      .filter((assignment) => !onlyGiverIds || onlyGiverIds.has(assignment.giverId))
      .map((assignment) => ({
        giverName: nameById.get(assignment.giverId) ?? '',
        receiverName: nameById.get(assignment.receiverId) ?? '',
      }))
      .sort((first, second) => first.giverName.localeCompare(second.giverName, 'th'));

    return {
      drawVersion,
      drawnAt: round?.drawnAt.toISOString() ?? null,
      availableVersions: Array.from({ length: event.currentDrawVersion }, (_, index) => index + 1),
      rows,
    };
  }
}
