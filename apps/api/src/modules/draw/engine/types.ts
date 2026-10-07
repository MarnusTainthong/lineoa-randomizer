import type { RuleType } from '@line-oa-randomizer/shared';

export interface DrawParticipant {
  id: string;
  displayName: string;
}

export interface DrawRule {
  type: RuleType;
  /** Directed rules (ONE_WAY / HISTORY / FORCE) use [from, to]. */
  participantIds: string[];
}

export interface DrawAssignment {
  giverId: string;
  receiverId: string;
}

export type DrawResult =
  | { isSuccessful: true; assignments: DrawAssignment[] }
  | { isSuccessful: false; reason: string };

/** Extension point: other draw modes can implement this later. */
export interface DrawStrategy {
  assign(participants: DrawParticipant[], rules: DrawRule[]): DrawResult;
}
