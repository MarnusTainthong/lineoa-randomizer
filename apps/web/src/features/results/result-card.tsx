import { forwardRef } from 'react';
import { TH } from '../../lib/th';
import { cn, formatThaiDate } from '../../lib/utils';

export interface ResultCardProps {
  eventName: string;
  /** Person drawn. Headline of the card. */
  receiverName: string;
  /** Optional line above the name; defaults to "you drew". */
  caption?: string;
  budget: number | null;
  exchangeDate: string | null;
  drawVersion: number;
  isReplaced?: boolean;
  /** "export" renders at a fixed 540x675 so the PNG comes out 1080x1350 at pixelRatio 2. */
  variant?: 'screen' | 'export';
}

/** Same design on the page and in the saved image. */
export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(function ResultCard(
  { eventName, receiverName, caption = TH.results.youDrew, budget, exchangeDate, drawVersion, isReplaced, variant = 'screen' },
  ref,
) {
  const isExport = variant === 'export';
  return (
    <div
      ref={ref}
      style={isExport ? { width: 540, height: 675 } : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-tertiary bg-primary-container px-6 text-center text-on-primary-container',
        isExport ? 'gap-6' : 'min-h-[360px] gap-5 py-10',
      )}
    >
      {/* Single-line ribbon instead of an illustration. */}
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-tertiary opacity-60" />
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-tertiary opacity-60" />

      <div className="relative z-10 flex flex-col items-center gap-5 rounded-2xl bg-primary-container px-6 py-6">
        <p className={cn('font-medium opacity-80', isExport ? 'text-xl' : 'text-sm')}>{eventName}</p>
        <p className={isExport ? 'text-lg' : 'text-sm'}>{caption}</p>
        <p className={cn('break-words font-bold', isExport ? 'text-6xl' : 'text-4xl')}>{receiverName}</p>
        <div className={cn('space-y-1 opacity-80', isExport ? 'text-lg' : 'text-xs')}>
          {budget !== null && <p>งบ {budget.toLocaleString('th-TH')} {TH.common.baht}</p>}
          {exchangeDate && <p>แลกของขวัญ {formatThaiDate(exchangeDate)}</p>}
          <p>
            {TH.common.round} {drawVersion}
            {isReplaced && ` (${TH.results.replaced})`}
          </p>
        </div>
      </div>
    </div>
  );
});
