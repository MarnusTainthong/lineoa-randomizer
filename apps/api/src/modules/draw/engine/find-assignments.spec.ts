import { RULE_TYPE } from '@secret-santa/shared';
import { checkFeasibility } from './check-feasibility';
import { findAssignments } from './find-assignments';
import type { DrawAssignment, DrawParticipant, DrawRule } from './types';

function createParticipants(count: number): DrawParticipant[] {
  return Array.from({ length: count }, (_, index) => ({ id: `p${index}`, displayName: `คนที่ ${index}` }));
}

function drawOrFail(participants: DrawParticipant[], rules: DrawRule[]): DrawAssignment[] {
  const result = findAssignments(participants, rules);
  if (!result.isSuccessful) throw new Error(`expected a draw but got: ${result.reason}`);
  return result.assignments;
}

function expectEveryoneGivesAndReceivesOnce(participants: DrawParticipant[], assignments: DrawAssignment[]) {
  const ids = participants.map((participant) => participant.id).sort();
  expect(assignments.map((assignment) => assignment.giverId).sort()).toEqual(ids);
  expect(assignments.map((assignment) => assignment.receiverId).sort()).toEqual(ids);
  for (const assignment of assignments) expect(assignment.giverId).not.toBe(assignment.receiverId);
}

function hasAssignment(assignments: DrawAssignment[], giverId: string, receiverId: string) {
  return assignments.some((assignment) => assignment.giverId === giverId && assignment.receiverId === receiverId);
}

describe('findAssignments', () => {
  it('gives 3 people exactly one receiver each and nobody draws themselves', () => {
    const participants = createParticipants(3);
    expectEveryoneGivesAndReceivesOnce(participants, drawOrFail(participants, []));
  });

  it('does not let a giver draw their own partner (mutual exclude, several couples)', () => {
    const participants = createParticipants(8);
    const rules: DrawRule[] = [
      { type: RULE_TYPE.MUTUAL_EXCLUDE, participantIds: ['p0', 'p1'] },
      { type: RULE_TYPE.MUTUAL_EXCLUDE, participantIds: ['p2', 'p3'] },
      { type: RULE_TYPE.MUTUAL_EXCLUDE, participantIds: ['p4', 'p5'] },
    ];
    for (let run = 0; run < 100; run += 1) {
      const assignments = drawOrFail(participants, rules);
      expectEveryoneGivesAndReceivesOnce(participants, assignments);
      expect(hasAssignment(assignments, 'p0', 'p1')).toBe(false);
      expect(hasAssignment(assignments, 'p1', 'p0')).toBe(false);
      expect(hasAssignment(assignments, 'p2', 'p3')).toBe(false);
      expect(hasAssignment(assignments, 'p5', 'p4')).toBe(false);
    }
  });

  it('only blocks one direction for one-way exclude', () => {
    const participants = createParticipants(4);
    const rules: DrawRule[] = [{ type: RULE_TYPE.ONE_WAY_EXCLUDE, participantIds: ['p0', 'p1'] }];
    let sawReverseDirection = false;
    for (let run = 0; run < 200; run += 1) {
      const assignments = drawOrFail(participants, rules);
      expect(hasAssignment(assignments, 'p0', 'p1')).toBe(false);
      if (hasAssignment(assignments, 'p1', 'p0')) sawReverseDirection = true;
    }
    expect(sawReverseDirection).toBe(true);
  });

  it('keeps people in the same group from drawing each other', () => {
    const participants = createParticipants(7);
    const rules: DrawRule[] = [{ type: RULE_TYPE.GROUP_EXCLUDE, participantIds: ['p0', 'p1', 'p2'] }];
    for (let run = 0; run < 100; run += 1) {
      const assignments = drawOrFail(participants, rules);
      for (const assignment of assignments) {
        const isGiverInGroup = ['p0', 'p1', 'p2'].includes(assignment.giverId);
        const isReceiverInGroup = ['p0', 'p1', 'p2'].includes(assignment.receiverId);
        expect(isGiverInGroup && isReceiverInGroup).toBe(false);
      }
    }
  });

  it('avoids last year pairs (history exclude)', () => {
    const participants = createParticipants(4);
    const rules: DrawRule[] = [{ type: RULE_TYPE.HISTORY_EXCLUDE, participantIds: ['p2', 'p3'] }];
    for (let run = 0; run < 100; run += 1) {
      expect(hasAssignment(drawOrFail(participants, rules), 'p2', 'p3')).toBe(false);
    }
  });

  it('honours a forced assignment', () => {
    const participants = createParticipants(5);
    const rules: DrawRule[] = [{ type: RULE_TYPE.FORCE_ASSIGN, participantIds: ['p0', 'p4'] }];
    for (let run = 0; run < 50; run += 1) {
      expect(hasAssignment(drawOrFail(participants, rules), 'p0', 'p4')).toBe(true);
    }
  });

  it('reports who has nobody left to draw when rules make a draw impossible', () => {
    const participants = createParticipants(3);
    const rules: DrawRule[] = [
      { type: RULE_TYPE.ONE_WAY_EXCLUDE, participantIds: ['p0', 'p1'] },
      { type: RULE_TYPE.ONE_WAY_EXCLUDE, participantIds: ['p0', 'p2'] },
    ];
    const result = findAssignments(participants, rules);
    expect(result.isSuccessful).toBe(false);
    if (!result.isSuccessful) expect(result.reason).toContain('คนที่ 0');
  });

  it('detects impossibility that no single person explains', () => {
    // p0 and p1 can only draw p2, so one of them has to miss out.
    const participants = createParticipants(4);
    const rules: DrawRule[] = [
      { type: RULE_TYPE.GROUP_EXCLUDE, participantIds: ['p0', 'p1', 'p3'] },
    ];
    const result = findAssignments(participants, rules);
    expect(result.isSuccessful).toBe(false);
  });

  it('refuses fewer than 3 participants', () => {
    expect(findAssignments(createParticipants(2), []).isSuccessful).toBe(false);
  });

  it('handles 150 participants with many couples quickly', () => {
    const participants = createParticipants(150);
    const rules: DrawRule[] = Array.from({ length: 70 }, (_, index) => ({
      type: RULE_TYPE.MUTUAL_EXCLUDE,
      participantIds: [`p${index * 2}`, `p${index * 2 + 1}`],
    }));
    const assignments = drawOrFail(participants, rules);
    expectEveryoneGivesAndReceivesOnce(participants, assignments);
    expect(hasAssignment(assignments, 'p0', 'p1')).toBe(false);
  });

  it('produces both possible 3-person cycles over repeated runs (randomness)', () => {
    const participants = createParticipants(3);
    const seenCycles = new Set<string>();
    for (let run = 0; run < 200; run += 1) {
      const assignments = drawOrFail(participants, []);
      seenCycles.add(
        assignments
          .map((assignment) => `${assignment.giverId}>${assignment.receiverId}`)
          .sort()
          .join(','),
      );
    }
    expect(seenCycles.size).toBe(2);
  });
});

describe('checkFeasibility', () => {
  it('flags too few participants', () => {
    expect(checkFeasibility(createParticipants(2), []).feasibility).toBe('TOO_FEW_PARTICIPANTS');
  });

  it('is OK for a normal room and never returns a sample result', () => {
    const check = checkFeasibility(createParticipants(4), []);
    expect(check).toEqual({ feasibility: 'OK', reason: null });
  });

  it('is INFEASIBLE with a reason when rules contradict', () => {
    const rules: DrawRule[] = [
      { type: RULE_TYPE.ONE_WAY_EXCLUDE, participantIds: ['p0', 'p1'] },
      { type: RULE_TYPE.ONE_WAY_EXCLUDE, participantIds: ['p0', 'p2'] },
    ];
    const check = checkFeasibility(createParticipants(3), rules);
    expect(check.feasibility).toBe('INFEASIBLE');
    expect(check.reason).toBeTruthy();
  });
});
