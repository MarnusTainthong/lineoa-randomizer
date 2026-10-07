import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_STATUS, type AuthResponse, type MockUserView } from '@line-oa-randomizer/shared';
import { DomainError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { FeasibilityService } from '../feasibility/feasibility.service';

/** Next generated test user: user-1, user-2, … skipping names already taken. */
export function nextMockDisplayName(existingNames: Iterable<string>): string {
  const taken = new Set(existingNames);
  let index = 1;
  while (taken.has(`user-${index}`)) index += 1;
  return `user-${index}`;
}

@Injectable()
export class DevService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly eventAccess: EventAccessService,
    private readonly feasibilityService: FeasibilityService,
  ) {}

  async listMockUsers(): Promise<MockUserView[]> {
    const users = await this.prisma.user.findMany({
      where: { isMockUser: true },
      orderBy: { createdAt: 'asc' },
    });
    return users.map((user) => ({ id: user.id, displayName: user.displayName }));
  }

  async createMockUser(displayName?: string): Promise<MockUserView> {
    const user = await this.prisma.user.create({
      data: {
        // "mock:" can never collide with real LINE ids, which start with "U".
        lineUserId: `mock:${randomUUID()}`,
        displayName: displayName?.trim() || (await this.nextDisplayName()),
        isMockUser: true,
      },
    });
    return { id: user.id, displayName: user.displayName };
  }

  async loginAsMockUser(mockUserId: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findFirst({ where: { id: mockUserId, isMockUser: true } });
    if (!user) throw new NotFoundException('ไม่พบ mock user');
    return this.authService.issueToken(user);
  }

  async addMockParticipants(eventId: string, userId: string, count: number): Promise<void> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    if (event.status !== EVENT_STATUS.OPEN)
      throw new DomainError('EVENT_NOT_OPEN', 'จับสลากไปแล้ว');

    const mockUsers = await this.prisma.user.findMany({ where: { isMockUser: true } });
    const joinedUserIds = new Set(
      (await this.prisma.participant.findMany({ where: { eventId } })).map(
        (participant) => participant.userId,
      ),
    );
    const usersToAdd = mockUsers.filter((user) => !joinedUserIds.has(user.id)).slice(0, count);
    while (usersToAdd.length < count) {
      const created = await this.createMockUser();
      usersToAdd.push(await this.prisma.user.findUniqueOrThrow({ where: { id: created.id } }));
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.participant.createMany({
        data: usersToAdd.map((user) => ({
          eventId,
          userId: user.id,
          displayName: user.displayName,
        })),
      });
      await this.feasibilityService.recompute(eventId, transaction);
    });
  }

  private async nextDisplayName(): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: { isMockUser: true },
      select: { displayName: true },
    });
    return nextMockDisplayName(users.map((user) => user.displayName));
  }
}
