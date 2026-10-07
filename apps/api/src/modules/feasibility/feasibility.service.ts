import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { checkFeasibility, type FeasibilityCheck } from '../draw/engine';

/** Prisma client or an open transaction, so callers can recompute inside their own transaction. */
type DatabaseClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class FeasibilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Dry-runs the draw for an event and stores the verdict. Call after every change to
   * participants or rules. The engine result contains no sample assignment.
   */
  async recompute(eventId: string, client: DatabaseClient = this.prisma): Promise<FeasibilityCheck> {
    const [participants, rules] = await Promise.all([
      client.participant.findMany({ where: { eventId }, select: { id: true, displayName: true } }),
      client.rule.findMany({ where: { eventId }, select: { type: true, participantIds: true } }),
    ]);

    const check = checkFeasibility(participants, rules);
    await client.event.update({
      where: { id: eventId },
      data: { feasibility: check.feasibility, feasibilityReason: check.reason },
    });
    return check;
  }
}
