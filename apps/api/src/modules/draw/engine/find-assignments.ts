import { MIN_PARTICIPANTS_TO_DRAW } from '@secret-santa/shared';
import { buildAllowedReceiverIdsByGiverId } from './build-allowed-matrix';
import { explainInfeasibility } from './explain-infeasibility';
import { findMaximumMatching } from './find-perfect-matching';
import { shuffleSecurely } from './secure-random';
import type { DrawAssignment, DrawParticipant, DrawResult, DrawRule, DrawStrategy } from './types';

/** Backtracking gives up after this many placements and falls back to randomized matching. */
const MAX_BACKTRACKING_STEPS = 50_000;

class BacktrackingBudgetExceeded extends Error {}

type AllowedReceiverIds = ReadonlyMap<string, readonly string[]>;

/**
 * Randomized backtracking: always place the giver with the fewest remaining options first,
 * try that giver's options in random order, and undo on conflict.
 */
function assignByBacktracking(
  giverIds: readonly string[],
  allowedReceiverIdsByGiverId: AllowedReceiverIds,
): Map<string, string> {
  const receiverIdByGiverId = new Map<string, string>();
  const usedReceiverIds = new Set<string>();
  let stepsTaken = 0;

  function placeRemainingGivers(): boolean {
    if (receiverIdByGiverId.size === giverIds.length) return true;

    let mostConstrainedGiverId: string | undefined;
    let fewestAvailableReceiverIds: string[] = [];
    for (const giverId of giverIds) {
      if (receiverIdByGiverId.has(giverId)) continue;
      const availableReceiverIds = (allowedReceiverIdsByGiverId.get(giverId) ?? []).filter(
        (receiverId) => !usedReceiverIds.has(receiverId),
      );
      if (mostConstrainedGiverId === undefined || availableReceiverIds.length < fewestAvailableReceiverIds.length) {
        mostConstrainedGiverId = giverId;
        fewestAvailableReceiverIds = availableReceiverIds;
      }
    }
    if (mostConstrainedGiverId === undefined || fewestAvailableReceiverIds.length === 0) return false;

    for (const receiverId of shuffleSecurely(fewestAvailableReceiverIds)) {
      stepsTaken += 1;
      if (stepsTaken > MAX_BACKTRACKING_STEPS) throw new BacktrackingBudgetExceeded();

      receiverIdByGiverId.set(mostConstrainedGiverId, receiverId);
      usedReceiverIds.add(receiverId);
      if (placeRemainingGivers()) return true;
      receiverIdByGiverId.delete(mostConstrainedGiverId);
      usedReceiverIds.delete(receiverId);
    }
    return false;
  }

  return placeRemainingGivers() ? receiverIdByGiverId : new Map();
}

function shuffleAllowedReceivers(allowedReceiverIdsByGiverId: AllowedReceiverIds): AllowedReceiverIds {
  return new Map(
    [...allowedReceiverIdsByGiverId].map(([giverId, receiverIds]) => [giverId, shuffleSecurely(receiverIds)]),
  );
}

/**
 * Finds a random valid Secret Santa assignment: everyone gives once, receives once,
 * never draws themselves, and respects all rules.
 *
 * Never throws for infeasible input; returns `{ isSuccessful: false, reason }` instead.
 */
export function findAssignments(participants: DrawParticipant[], rules: DrawRule[]): DrawResult {
  if (participants.length < MIN_PARTICIPANTS_TO_DRAW) {
    return { isSuccessful: false, reason: `ต้องมีผู้เข้าร่วมอย่างน้อย ${MIN_PARTICIPANTS_TO_DRAW} คน` };
  }

  const allowedReceiverIdsByGiverId = buildAllowedReceiverIdsByGiverId(participants, rules);
  const giverIds = participants.map((participant) => participant.id);

  // Cheap exact check first so we never backtrack through an impossible problem.
  const maximumMatching = findMaximumMatching(giverIds, allowedReceiverIdsByGiverId);
  if (maximumMatching.size < giverIds.length) {
    const unmatchedGiverId = giverIds.find((giverId) => !maximumMatching.has(giverId));
    return {
      isSuccessful: false,
      reason: explainInfeasibility(participants, allowedReceiverIdsByGiverId, unmatchedGiverId),
    };
  }

  let receiverIdByGiverId: Map<string, string>;
  try {
    receiverIdByGiverId = assignByBacktracking(giverIds, allowedReceiverIdsByGiverId);
  } catch (error) {
    if (!(error instanceof BacktrackingBudgetExceeded)) throw error;
    receiverIdByGiverId = findMaximumMatching(
      shuffleSecurely(giverIds),
      shuffleAllowedReceivers(allowedReceiverIdsByGiverId),
    );
  }

  const assignments: DrawAssignment[] = giverIds.map((giverId) => ({
    giverId,
    receiverId: receiverIdByGiverId.get(giverId) as string,
  }));
  return { isSuccessful: true, assignments };
}

export class SecretSantaStrategy implements DrawStrategy {
  assign(participants: DrawParticipant[], rules: DrawRule[]): DrawResult {
    return findAssignments(participants, rules);
  }
}
