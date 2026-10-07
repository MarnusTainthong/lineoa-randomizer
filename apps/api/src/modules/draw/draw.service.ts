import { Injectable } from '@nestjs/common';
import { EVENT_STATUS, FEASIBILITY, type DrawResponse } from '@secret-santa/shared';
import { DomainError, NoValidAssignmentError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SecretSantaStrategy, checkFeasibility, type DrawStrategy } from './engine';

type DrawMode = 'DRAW' | 'REDRAW';

@Injectable()
export class DrawService {
  // Swap this to support other draw modes later.
  private readonly drawStrategy: DrawStrategy = new SecretSantaStrategy();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventAccess: EventAccessService,
  ) {}

  async draw(eventId: string, userId: string, mode: DrawMode): Promise<DrawResponse> {
    await this.eventAccess.requireOrganizedEvent(eventId, userId);

    return this.prisma.$transaction(async (transaction) => {
      // Row lock: two concurrent draw requests are serialized, the second sees the new status.
      await transaction.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
      const event = await transaction.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { participants: true, rules: true },
      });

      const expectedStatus = mode === 'DRAW' ? EVENT_STATUS.OPEN : EVENT_STATUS.DRAWN;
      if (event.status !== expectedStatus) {
        throw new DomainError(
          mode === 'DRAW' ? 'ALREADY_DRAWN' : 'NOT_DRAWN_YET',
          mode === 'DRAW' ? 'ห้องนี้จับสลากไปแล้ว' : 'ยังไม่ได้จับสลาก',
        );
      }

      // Never trust the cached feasibility: re-check inside the same transaction.
      const feasibilityCheck = checkFeasibility(event.participants, event.rules);
      if (feasibilityCheck.feasibility !== FEASIBILITY.OK) {
        throw new NoValidAssignmentError(feasibilityCheck.reason ?? 'จับสลากไม่ได้');
      }

      const drawResult = this.drawStrategy.assign(event.participants, event.rules);
      if (!drawResult.isSuccessful) throw new NoValidAssignmentError(drawResult.reason);

      const drawVersion = event.currentDrawVersion + 1;
      await transaction.drawRound.create({ data: { eventId, version: drawVersion, drawnById: userId } });
      await transaction.assignment.createMany({
        data: drawResult.assignments.map((assignment) => ({
          eventId,
          giverId: assignment.giverId,
          receiverId: assignment.receiverId,
          drawVersion,
        })),
      });
      await transaction.event.update({
        where: { id: eventId },
        data: { status: EVENT_STATUS.DRAWN, currentDrawVersion: drawVersion },
      });
      await transaction.auditLog.create({ data: { eventId, actorId: userId, action: mode } });

      return { drawVersion };
    });
  }
}
