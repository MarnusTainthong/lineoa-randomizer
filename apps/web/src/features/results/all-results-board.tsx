import { forwardRef } from 'react';
import type { ResultRow } from '@line-oa-randomizer/shared';
import { TH } from '../../lib/th';
import { formatThaiDate } from '../../lib/utils';
import { orderDrawCycles } from './order-draw-chain';

export interface AllResultsBoardProps {
  eventName: string;
  drawVersion: number;
  drawnAt: string | null;
  rows: ResultRow[];
}

/** One round, listed so each person is followed by the person they drew. */
export const AllResultsBoard = forwardRef<HTMLDivElement, AllResultsBoardProps>(function AllResultsBoard(
  { eventName, drawVersion, drawnAt, rows },
  ref,
) {
  const rowsInOrder = orderDrawCycles(rows).flat();
  return (
    <div ref={ref} className="overflow-hidden rounded-3xl bg-surface-container text-on-surface">
      <header className="bg-primary px-5 py-5 text-on-primary">
        <p className="text-sm font-medium opacity-80">{TH.results.allResultsTitle}</p>
        {eventName && <p className="mt-1 text-2xl font-bold leading-tight">{eventName}</p>}
        <p className="mt-2 text-sm">
          {TH.common.round} {drawVersion}
          {drawnAt && ` · ${formatThaiDate(drawnAt, true)}`}
        </p>
      </header>
      <ol>
        {rowsInOrder.map((row, index) => (
          <li
            key={row.giverId}
            className="flex items-center gap-3 border-t border-outline-variant px-4 py-3.5 first:border-t-0"
          >
            <span className="w-6 shrink-0 text-sm font-medium text-on-surface-variant">{index + 1}</span>
            <span className="min-w-0 flex-1 break-words font-semibold">{row.giverName}</span>
            <span className="shrink-0 text-sm font-medium text-secondary">{TH.results.drew}</span>
            <span className="min-w-0 flex-1 break-words text-right font-semibold">{row.receiverName}</span>
          </li>
        ))}
      </ol>
    </div>
  );
});