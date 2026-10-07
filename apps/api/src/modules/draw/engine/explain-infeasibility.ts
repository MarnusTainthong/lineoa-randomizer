import type { DrawParticipant } from './types';

/**
 * Human-readable (Thai) reason why no valid draw exists. Only the organizer ever sees this,
 * and it never reveals a sample assignment.
 */
export function explainInfeasibility(
  participants: DrawParticipant[],
  allowedReceiverIdsByGiverId: ReadonlyMap<string, readonly string[]>,
  unmatchedGiverId?: string,
): string {
  const nameById = new Map(participants.map((participant) => [participant.id, participant.displayName]));

  for (const participant of participants) {
    if ((allowedReceiverIdsByGiverId.get(participant.id) ?? []).length === 0) {
      return `${participant.displayName} ไม่มีใครให้จับได้ เพราะติดกติกา`;
    }
  }

  const receiverIdsWithSomeGiver = new Set<string>();
  for (const receiverIds of allowedReceiverIdsByGiverId.values()) {
    receiverIds.forEach((receiverId) => receiverIdsWithSomeGiver.add(receiverId));
  }
  const unreachableReceiver = participants.find(
    (participant) => !receiverIdsWithSomeGiver.has(participant.id),
  );
  if (unreachableReceiver) {
    return `ไม่มีใครจับ ${unreachableReceiver.displayName} ได้ เพราะติดกติกา`;
  }

  const unmatchedName = unmatchedGiverId ? nameById.get(unmatchedGiverId) : undefined;
  return unmatchedName
    ? `กติกาที่ตั้งไว้ทำให้จับสลากครบทุกคนไม่ได้ ลองดูกติกาที่เกี่ยวกับ ${unmatchedName}`
    : 'กติกาที่ตั้งไว้ทำให้จับสลากครบทุกคนไม่ได้';
}
