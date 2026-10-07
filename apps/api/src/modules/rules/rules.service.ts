import { Injectable, NotFoundException } from '@nestjs/common';
import type { Rule } from '@prisma/client';
import { DIRECTED_RULE_TYPES, EVENT_STATUS, type RuleType, type RuleView } from '@line-oa-randomizer/shared';
import { DomainError } from '../../common/domain-error';
import { EventAccessService } from '../../common/event-access.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FeasibilityService } from '../feasibility/feasibility.service';

function toRuleView(rule: Rule): RuleView {
  return { id: rule.id, type: rule.type, participantIds: rule.participantIds, note: rule.note };
}

@Injectable()
export class RulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventAccess: EventAccessService,
    private readonly feasibilityService: FeasibilityService,
  ) {}

  async list(eventId: string, userId: string): Promise<RuleView[]> {
    await this.eventAccess.requireOrganizedEvent(eventId, userId);
    const rules = await this.prisma.rule.findMany({ where: { eventId }, orderBy: { id: 'asc' } });
    return rules.map(toRuleView);
  }

  /** A rule that makes the draw impossible is still saved; feasibility explains the problem. */
  async create(
    eventId: string,
    userId: string,
    input: { type: RuleType; participantIds: string[]; note?: string },
  ): Promise<RuleView> {
    await this.requireEditableEvent(eventId, userId);
    await this.validateRuleShape(eventId, input.type, input.participantIds);

    const rule = await this.prisma.$transaction(async (transaction) => {
      const createdRule = await transaction.rule.create({
        data: { eventId, type: input.type, participantIds: input.participantIds, note: input.note?.trim() || null },
      });
      await transaction.auditLog.create({ data: { eventId, actorId: userId, action: 'RULE_CHANGED' } });
      await this.feasibilityService.recompute(eventId, transaction);
      return createdRule;
    });
    return toRuleView(rule);
  }

  async update(
    eventId: string,
    userId: string,
    ruleId: string,
    input: { type?: RuleType; participantIds?: string[]; note?: string },
  ): Promise<RuleView> {
    await this.requireEditableEvent(eventId, userId);
    const existingRule = await this.prisma.rule.findFirst({ where: { id: ruleId, eventId } });
    if (!existingRule) throw new NotFoundException('ไม่พบกติกา');

    const type = input.type ?? existingRule.type;
    const participantIds = input.participantIds ?? existingRule.participantIds;
    await this.validateRuleShape(eventId, type, participantIds);

    const rule = await this.prisma.$transaction(async (transaction) => {
      const updatedRule = await transaction.rule.update({
        where: { id: ruleId },
        data: { type, participantIds, note: input.note === undefined ? undefined : input.note.trim() || null },
      });
      await transaction.auditLog.create({ data: { eventId, actorId: userId, action: 'RULE_CHANGED' } });
      await this.feasibilityService.recompute(eventId, transaction);
      return updatedRule;
    });
    return toRuleView(rule);
  }

  async remove(eventId: string, userId: string, ruleId: string): Promise<void> {
    await this.requireEditableEvent(eventId, userId);
    const existingRule = await this.prisma.rule.findFirst({ where: { id: ruleId, eventId } });
    if (!existingRule) throw new NotFoundException('ไม่พบกติกา');

    await this.prisma.$transaction(async (transaction) => {
      await transaction.rule.delete({ where: { id: ruleId } });
      await transaction.auditLog.create({ data: { eventId, actorId: userId, action: 'RULE_CHANGED' } });
      await this.feasibilityService.recompute(eventId, transaction);
    });
  }

  private async requireEditableEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.eventAccess.requireOrganizedEvent(eventId, userId);
    if (event.status === EVENT_STATUS.CLOSED) throw new DomainError('EVENT_CLOSED', 'ห้องนี้ปิดแล้ว');
  }

  private async validateRuleShape(eventId: string, type: RuleType, participantIds: string[]): Promise<void> {
    const uniqueIds = new Set(participantIds);
    const isDirected = DIRECTED_RULE_TYPES.includes(type);
    const hasValidSize = isDirected ? participantIds.length === 2 : participantIds.length >= 2;
    if (!hasValidSize || uniqueIds.size !== participantIds.length) {
      throw new DomainError(
        'INVALID_RULE',
        isDirected ? 'กติกานี้ต้องเลือก 2 คน (คนจับ → คนที่ถูกจับ)' : 'กติกานี้ต้องเลือกอย่างน้อย 2 คน',
        400,
      );
    }

    const matchingCount = await this.prisma.participant.count({
      where: { eventId, id: { in: participantIds } },
    });
    if (matchingCount !== participantIds.length) {
      throw new DomainError('INVALID_RULE', 'มีคนที่ไม่ได้อยู่ในห้องนี้', 400);
    }
  }
}
