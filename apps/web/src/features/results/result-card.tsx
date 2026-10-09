import { forwardRef } from 'react';
import { TH } from '../../lib/th';

export interface ResultCardProps {
  eventName: string;
  /** Person drawn. Headline of the card. */
  receiverName: string;
  /** Optional line above the name; defaults to "you drew". */
  caption?: string;
  drawVersion: number;
  isReplaced?: boolean;
}

/** Gift mark drawn as SVG so the saved image does not depend on the icon font. */
function GiftSeal() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="currentColor" aria-hidden>
      <path d="M20 6h-2.18A3 3 0 0 0 15 2c-1.1 0-2.07.6-2.6 1.5h-.01L12 4.17l-.39-.67A3 3 0 0 0 9 2a3 3 0 0 0-2.82 4H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2ZM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1ZM4 8h7v2H4V8Zm2 12v-8h5v8H6Zm12 0h-5v-8h5v8Zm2-10h-7V8h7v2Z" />
    </svg>
  );
}

/** Gift-wrap card. The node on screen is the node saved as an image. */
export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(function ResultCard(
  { eventName, receiverName, caption = TH.results.youDrew, drawVersion, isReplaced },
  ref,
) {
  return (
    <div ref={ref} className="relative aspect-square w-full overflow-hidden rounded-3xl bg-primary text-on-primary">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: 'var(--polygon-pattern)', backgroundSize: '220px 256px' }}
      />
      {/* Offsets instead of translate: percentage transforms shift when the card is painted into an image. */}
      <div aria-hidden className="absolute inset-x-0 top-[calc(50%-1.125rem)] h-9 bg-secondary" />
      <div aria-hidden className="absolute inset-y-0 left-[calc(50%-1.125rem)] w-9 bg-secondary" />

      <div className="absolute inset-10 z-20 rounded-2xl bg-[var(--surface-bright)] text-on-surface">
        <span className="absolute left-[calc(50%-1.375rem)] top-[-1.375rem] z-10 flex size-11 items-center justify-center rounded-full bg-[var(--tertiary)] text-on-primary">
          <GiftSeal />
        </span>
        {/* Table centering keeps the same text position in the saved image. Flex does not. */}
        <div className="table h-full w-full">
          <div className="table-cell px-5 align-middle text-center">
            <p className="text-sm font-medium text-on-surface-variant">{eventName}</p>
            <p className="mt-3 text-sm font-medium text-secondary">{caption}</p>
            <p className="mt-3 break-words text-4xl font-bold leading-tight text-primary">{receiverName}</p>
            <p className="mt-3 text-xs text-on-surface-variant">
              {TH.common.round} {drawVersion}
              {isReplaced && ` · ${TH.results.replaced}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
