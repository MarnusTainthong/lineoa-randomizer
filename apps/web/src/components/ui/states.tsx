import type { ReactNode } from 'react';
import { TH } from '../../lib/th';
import { Button } from './button';

export function LoadingState() {
  return <p className="py-12 text-center text-on-surface-variant">{TH.common.loading}</p>;
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="max-w-xs text-on-surface-variant">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : TH.common.errorTitle;
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="font-medium text-error">{TH.common.errorTitle}</p>
      <p className="text-sm text-on-surface-variant">{message}</p>
      {onRetry && <Button variant="tonal" onClick={onRetry}>{TH.common.retry}</Button>}
    </div>
  );
}

/** Switches between loading / error / content for a TanStack query result. */
export function QueryBoundary<T>({
  query,
  children,
}: {
  query: { data: T | undefined; error: unknown; isPending: boolean; refetch: () => unknown };
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <LoadingState />;
  if (query.error || query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }
  return <>{children(query.data)}</>;
}
