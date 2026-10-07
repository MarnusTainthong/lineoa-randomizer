import type { MyResult, ResultHistoryEntry } from '@line-oa-randomizer/shared';
import { useRef } from 'react';
import { Chip } from '../../components/ui/chip';
import { TH } from '../../lib/th';
import { formatThaiDate } from '../../lib/utils';
import { ResultCard } from './result-card';
import { SaveImageButton } from './save-image-button';

function HistoryItem({ entry, result }: { entry: ResultHistoryEntry; result: MyResult }) {
  const exportRef = useRef<HTMLDivElement>(null);
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant">
          {TH.common.round} {entry.drawVersion} · {formatThaiDate(entry.drawnAt, true)}
        </p>
        <p className="truncate font-medium">{entry.receiverName}</p>
        <Chip tone={entry.isCurrent ? 'primary' : 'neutral'}>
          {entry.isCurrent ? TH.results.current : TH.results.replaced}
        </Chip>
      </div>
      <SaveImageButton
        targetRef={exportRef}
        fileName={`line-oa-randomizer-round-${entry.drawVersion}.png`}
      />
      {/* Offscreen render target for the PNG; old rounds carry a "replaced" label. */}
      <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
        <ResultCard
          ref={exportRef}
          variant="export"
          eventName={result.eventName}
          receiverName={entry.receiverName}
          drawVersion={entry.drawVersion}
          isReplaced={!entry.isCurrent}
        />
      </div>
    </li>
  );
}

export function HistoryList({
  entries,
  result,
}: {
  entries: ResultHistoryEntry[];
  result: MyResult;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-on-surface-variant">{TH.results.historyTitle}</h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <HistoryItem key={entry.drawVersion} entry={entry} result={result} />
        ))}
      </ul>
    </section>
  );
}
