import { RULE_TYPE } from '@line-oa-randomizer/shared';
import type { DrawParticipant, DrawRule } from './types';

/** Directed pairs "giver must not draw receiver" produced by the rules. */
function buildForbiddenPairs(rules: DrawRule[]): Array<[string, string]> {
  const forbiddenPairs: Array<[string, string]> = [];

  for (const rule of rules) {
    const [firstId, secondId] = rule.participantIds;
    switch (rule.type) {
      case RULE_TYPE.MUTUAL_EXCLUDE:
      case RULE_TYPE.GROUP_EXCLUDE:
        for (const giverId of rule.participantIds) {
          for (const receiverId of rule.participantIds) {
            if (giverId !== receiverId) forbiddenPairs.push([giverId, receiverId]);
          }
        }
        break;
      case RULE_TYPE.ONE_WAY_EXCLUDE:
      case RULE_TYPE.HISTORY_EXCLUDE:
        if (firstId && secondId) forbiddenPairs.push([firstId, secondId]);
        break;
      case RULE_TYPE.FORCE_ASSIGN:
        break; // handled as a restriction, see below
    }
  }
  return forbiddenPairs;
}

/**
 * Builds, for each giver, the list of receivers they may legally draw.
 * Self-draws and rule-forbidden pairs are removed; FORCE_ASSIGN narrows a giver to one receiver
 * (and yields an empty list when that receiver is otherwise forbidden or forced rules conflict).
 */
export function buildAllowedReceiverIdsByGiverId(
  participants: DrawParticipant[],
  rules: DrawRule[],
): Map<string, string[]> {
  const forbiddenReceiverIdsByGiverId = new Map<string, Set<string>>();
  for (const [giverId, receiverId] of buildForbiddenPairs(rules)) {
    const forbiddenReceiverIds = forbiddenReceiverIdsByGiverId.get(giverId) ?? new Set<string>();
    forbiddenReceiverIds.add(receiverId);
    forbiddenReceiverIdsByGiverId.set(giverId, forbiddenReceiverIds);
  }

  const forcedReceiverIdsByGiverId = new Map<string, Set<string>>();
  for (const rule of rules) {
    if (rule.type !== RULE_TYPE.FORCE_ASSIGN) continue;
    const [giverId, receiverId] = rule.participantIds;
    if (!giverId || !receiverId) continue;
    const forcedReceiverIds = forcedReceiverIdsByGiverId.get(giverId) ?? new Set<string>();
    forcedReceiverIds.add(receiverId);
    forcedReceiverIdsByGiverId.set(giverId, forcedReceiverIds);
  }

  const allowedReceiverIdsByGiverId = new Map<string, string[]>();
  for (const giver of participants) {
    const forbiddenReceiverIds = forbiddenReceiverIdsByGiverId.get(giver.id);
    const forcedReceiverIds = forcedReceiverIdsByGiverId.get(giver.id);

    const allowedReceiverIds = participants
      .filter((receiver) => receiver.id !== giver.id)
      .filter((receiver) => !forbiddenReceiverIds?.has(receiver.id))
      .filter((receiver) => !forcedReceiverIds || forcedReceiverIds.has(receiver.id))
      // Two different forced receivers for the same giver can never both be satisfied.
      .filter(() => !forcedReceiverIds || forcedReceiverIds.size === 1)
      .map((receiver) => receiver.id);

    allowedReceiverIdsByGiverId.set(giver.id, allowedReceiverIds);
  }
  return allowedReceiverIdsByGiverId;
}
