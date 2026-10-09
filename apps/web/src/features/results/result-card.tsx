import { forwardRef } from 'react';
import { TH } from '../../lib/th';
import { cn } from '../../lib/utils';

export interface ResultCardProps {
  eventName: string;
  /** Person drawn. Headline of the card. */
  receiverName: string;
  /** Optional line above the name; defaults to "you drew". */
  caption?: string;
  drawVersion: number;
  isReplaced?: boolean;
  /** Fixed 540×540 so the saved PNG is square at pixelRatio 2. */
  variant?: 'screen' | 'export';
}

/** Gift-wrap card. The same square layout is shown on screen and saved as an image. */
export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(function ResultCard(
  {
    eventName,
    receiverName,
    caption = TH.results.youDrew,
    drawVersion,
    isReplaced,
    variant = 'screen',
  },
  ref,
) {
  const isExport = variant === 'export';
  return (
    <div
      ref={ref}
      style={isExport ? { width: 540, height: 540 } : undefined}
      className={cn(
        'relative overflow-hidden rounded-3xl bg-primary text-on-primary',
        !isExport && 'aspect-square w-full',
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: 'var(--polygon-pattern)', backgroundSize: '220px 256px' }}
      />
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 bg-secondary" />
      <div aria-hidden className="absolute inset-y-0 left-1/2 w-9 -translate-x-1/2 bg-secondary" />

      <div
        className={cn(
          'absolute z-20 flex flex-col items-center justify-center rounded-2xl bg-[var(--surface-bright)] text-center text-on-surface',
          isExport ? 'inset-16 gap-4 px-8 pt-8' : 'inset-10 gap-3 px-5 pt-6',
        )}
      >
        <span
          className="absolute left-1/2 top-0 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--tertiary)] text-on-primary"
          aria-hidden
        >
          <span className="material-symbols-outlined !text-[22px]">redeem</span>
        </span>
        <p className={cn('font-medium text-on-surface-variant', isExport ? 'text-xl' : 'text-sm')}>
          {eventName}
        </p>
        <p className={cn('font-medium text-secondary', isExport ? 'text-lg' : 'text-sm')}>{caption}</p>
        <p
          className={cn(
            'break-words font-bold leading-tight text-primary',
            isExport ? 'text-5xl' : 'text-4xl',
          )}
        >
          {receiverName}
        </p>
        <p className={cn('text-on-surface-variant', isExport ? 'text-lg' : 'text-xs')}>
          {TH.common.round} {drawVersion}
          {isReplaced && ` · ${TH.results.replaced}`}
        </p>
      </div>
    </div>
  );
});