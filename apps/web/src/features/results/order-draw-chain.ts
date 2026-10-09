import type { ResultRow } from '@line-oa-randomizer/shared';

/**
 * Splits a round into the loops it actually formed.
 * A secret-santa draw is a permutation, so it can be one loop or several.
 * Identity is the participant id, so two people with the same name still chain.
 */
export function orderDrawCycles(rows: ResultRow[]): ResultRow[][] {
  const byGiverId = new Map(rows.map((row) => [row.giverId, row]));
  const remaining = new Set(byGiverId.keys());
  const cycles: ResultRow[][] = [];

  const starts = [...remaining].sort((firstId, secondId) => {
    const firstName = byGiverId.get(firstId)?.giverName ?? '';
    const secondName = byGiverId.get(secondId)?.giverName ?? '';
    return firstName.localeCompare(secondName, 'th');
  });

  for (const startId of starts) {
    if (!remaining.has(startId)) continue;
    const cycle: ResultRow[] = [];
    let giverId: string | undefined = startId;
    while (giverId && remaining.has(giverId)) {
      const row = byGiverId.get(giverId);
      if (!row) break;
      remaining.delete(giverId);
      cycle.push(row);
      giverId = row.receiverId;
    }
    if (cycle.length > 0) cycles.push(cycle);
  }

  return cycles;
}
