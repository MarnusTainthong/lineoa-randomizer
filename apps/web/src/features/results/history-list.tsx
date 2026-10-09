import type { ResultHistoryEntry } from '@line-oa-randomizer/shared';
import { Chip } from '../../components/ui/chip';
import { TH } from '../../lib/th';
import { cn, formatThaiDate } from '../../lib/utils';

export function HistoryList({
  entries,
  selectedVersion,
  onSelect,
}: {
  entries: ResultHistoryEntry[];
  selectedVersion: number;
  onSelect: (entry: ResultHistoryEntry) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-on-surface-variant">{TH.results.historyTitle}</h2>
      <ul className="space-y-2">
        {entries.map((entry) => {
          const isSelected = entry.drawVersion === selectedVersion;
          return (
            <li key={entry.drawVersion}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(entry)}
                className={cn(
                  'state-layer flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left',
                  isSelected ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container',
                )}
              >
                <span className="min-w-0">
                  <span className="block text-xs opacity-80">
                    {TH.common.round} {entry.drawVersion} · {formatThaiDate(entry.drawnAt, true)}
                  </span>
                  <span className="block truncate font-medium">{entry.receiverName}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    {entry.isCurrent && <Chip tone="primary">{TH.results.current}</Chip>}
                    {entry.ruleCount !== null && (
                      <span className="text-xs opacity-80">{TH.results.ruleCount(entry.ruleCount)}</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
