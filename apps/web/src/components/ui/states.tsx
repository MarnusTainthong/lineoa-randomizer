import type { ReactNode } from 'react';
import { TH } from '../../lib/th';
import { Button } from './button';

function LoadingLabel() {
  return <span className="sr-only">{TH.common.loading}</span>;
}

/** Spinner plus the loading label. Used while auth or a short action is in flight. */
export function LoadingIndicator() {
  return (
    <p
      role="status"
      className="flex items-center justify-center gap-3 py-12 text-sm text-on-surface-variant"
    >
      <span
        className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
      {TH.common.loading}
    </p>
  );
}

/** Row placeholders that match the room and user lists. */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-busy="true" className="space-y-2">
      <LoadingLabel />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex min-h-20 items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container px-4 py-4"
        >
          <div className="size-11 shrink-0 animate-pulse rounded-full bg-surface-container-high" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-3 w-1/4 animate-pulse rounded-md bg-surface-container-high" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Centered block for a single action screen, such as join or draw. */
export function PanelSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col items-center gap-4 py-16">
      <LoadingLabel />
      <div className="h-7 w-40 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="h-4 w-28 animate-pulse rounded-lg bg-surface-container-high" />
      <div className="mt-2 h-12 w-40 animate-pulse rounded-2xl bg-surface-container-high" />
    </div>
  );
}

/** Placeholder for the result envelope. */
export function CardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="min-h-[360px] animate-pulse rounded-3xl bg-primary-container"
    >
      <LoadingLabel />
    </div>
  );
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
      {onRetry && (
        <Button variant="tonal" onClick={onRetry}>
          {TH.common.retry}
        </Button>
      )}
    </div>
  );
}

/** Switches between loading / error / content for a TanStack query result. */
export function QueryBoundary<T>({
  query,
  pending = <ListSkeleton />,
  children,
}: {
  query: { data: T | undefined; error: unknown; isPending: boolean; refetch: () => unknown };
  pending?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return pending;
  if (query.error || query.data === undefined) {
    return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  }
  return <>{children(query.data)}</>;
}
