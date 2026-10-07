import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ChipTone = 'neutral' | 'primary' | 'accent' | 'error';

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
  accent: 'bg-secondary-container text-on-secondary-container',
  error: 'bg-error-container text-error',
};

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}
