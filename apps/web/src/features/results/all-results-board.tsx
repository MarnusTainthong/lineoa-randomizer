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
      <table className="w-full border-collapse text-left">
        <tbody>
          {rowsInOrder.map((row, index) => (
            <tr key={row.giverId} className="border-t border-outline-variant first:border-t-0">
              <td className="w-10 py-3.5 pl-4 align-middle text-sm font-medium text-on-surface-variant">
                {index + 1}
              </td>
              <td className="break-words py-3.5 align-middle font-semibold">{row.giverName}</td>
              <td className="whitespace-nowrap px-3 py-3.5 align-middle text-sm font-medium text-secondary">
                {TH.results.drew}
              </td>
              <td className="break-words py-3.5 pr-4 text-right align-middle font-semibold">{row.receiverName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});