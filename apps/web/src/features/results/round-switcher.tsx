import { TH } from '../../lib/th';
import { cn } from '../../lib/utils';

/** Chips to switch between draw rounds (newest first). */
export function RoundSwitcher({
  versions,
  selectedVersion,
  onSelect,
}: {
  versions: number[];
  selectedVersion: number;
  onSelect: (version: number) => void;
}) {
  if (versions.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {[...versions].reverse().map((version) => (
        <button
          key={version}
          type="button"
          role="tab"
          aria-selected={version === selectedVersion}
          onClick={() => onSelect(version)}
          className={cn(
            'state-layer min-h-12 rounded-xl px-4 text-sm font-medium',
            version === selectedVersion ? 'bg-primary-container text-on-primary-container' : 'border border-outline text-on-surface-variant',
          )}
        >
          {TH.common.round} {version}
        </button>
      ))}
    </div>
  );
}
