import { FEASIBILITY, MIN_PARTICIPANTS_TO_DRAW, type Feasibility } from '@secret-santa/shared';
import { buildAllowedReceiverIdsByGiverId } from './build-allowed-matrix';
import { explainInfeasibility } from './explain-infeasibility';
import { findMaximumMatching } from './find-perfect-matching';
import type { DrawParticipant, DrawRule } from './types';

export interface FeasibilityCheck {
  feasibility: Feasibility;
  reason: string | null;
}

/**
 * Dry run: answers only "can a valid draw exist?" plus a reason. It deliberately returns no
 * sample assignment, so the organizer can never peek at results through this check.
 */
export function checkFeasibility(participants: DrawParticipant[], rules: DrawRule[]): FeasibilityCheck {
  if (participants.length < MIN_PARTICIPANTS_TO_DRAW) {
    return {
      feasibility: FEASIBILITY.TOO_FEW_PARTICIPANTS,
      reason: `ต้องมีผู้เข้าร่วมอย่างน้อย ${MIN_PARTICIPANTS_TO_DRAW} คน (ตอนนี้ ${participants.length} คน)`,
    };
  }

  const allowedReceiverIdsByGiverId = buildAllowedReceiverIdsByGiverId(participants, rules);
  const giverIds = participants.map((participant) => participant.id);
  const maximumMatching = findMaximumMatching(giverIds, allowedReceiverIdsByGiverId);

  if (maximumMatching.size === giverIds.length) {
    return { feasibility: FEASIBILITY.OK, reason: null };
  }
  const unmatchedGiverId = giverIds.find((giverId) => !maximumMatching.has(giverId));
  return {
    feasibility: FEASIBILITY.INFEASIBLE,
    reason: explainInfeasibility(participants, allowedReceiverIdsByGiverId, unmatchedGiverId),
  };
}
