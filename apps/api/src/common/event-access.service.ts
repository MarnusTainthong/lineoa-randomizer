import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Event, Participant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Central place for "who may touch this event" checks, shared by every module. */
@Injectable()
export class EventAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async requireOrganizedEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('ไม่พบห้องนี้');
    if (event.organizerId !== userId) throw new ForbiddenException('เฉพาะผู้จัดเท่านั้น');
    return event;
  }

  /** The caller's own participant row. Non-members get 404 so room ids cannot be probed. */
  async requireMembership(
    eventId: string,
    userId: string,
  ): Promise<{ event: Event; participant: Participant }> {
    const participant = await this.prisma.participant.findUnique({
      where: { eventId_userId: { eventId, userId } },
      include: { event: true },
    });
    if (!participant) throw new NotFoundException('ไม่พบห้องนี้');
    const { event, ...participantFields } = participant;
    return { event, participant: participantFields };
  }
}
