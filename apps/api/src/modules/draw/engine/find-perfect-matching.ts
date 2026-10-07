/**
 * Augmenting-path bipartite matching (Kuhn). Used to answer "is any valid draw possible?"
 * in polynomial time, and as a fallback when randomized backtracking takes too long.
 *
 * @returns giverId -> receiverId for every matched giver (may be partial when no perfect matching exists)
 */
export function findMaximumMatching(
  giverIds: readonly string[],
  allowedReceiverIdsByGiverId: ReadonlyMap<string, readonly string[]>,
): Map<string, string> {
  const giverIdByReceiverId = new Map<string, string>();

  function tryAssign(giverId: string, visitedReceiverIds: Set<string>): boolean {
    for (const receiverId of allowedReceiverIdsByGiverId.get(giverId) ?? []) {
      if (visitedReceiverIds.has(receiverId)) continue;
      visitedReceiverIds.add(receiverId);

      const currentGiverId = giverIdByReceiverId.get(receiverId);
      if (currentGiverId === undefined || tryAssign(currentGiverId, visitedReceiverIds)) {
        giverIdByReceiverId.set(receiverId, giverId);
        return true;
      }
    }
    return false;
  }

  for (const giverId of giverIds) {
    tryAssign(giverId, new Set<string>());
  }

  const receiverIdByGiverId = new Map<string, string>();
  for (const [receiverId, giverId] of giverIdByReceiverId) {
    receiverIdByGiverId.set(giverId, receiverId);
  }
  return receiverIdByGiverId;
}
