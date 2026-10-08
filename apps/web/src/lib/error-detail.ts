import { ApiError } from './api-client';
import { liffIdFor } from './liff';

export const showErrorDetails = import.meta.env.VITE_SHOW_ERRORS === 'true';

/** Safe diagnostic text. Omits the URL hash, which can hold LINE tokens. */
export function formatErrorDetail(error: unknown): string | null {
  if (!showErrorDetails) return null;
  const lines = [
    error instanceof Error ? `${error.name}: ${error.message}` : String(error),
  ];
  if (error instanceof ApiError) lines.push(`status: ${error.status} ${error.code}`);
  lines.push(`page: ${window.location.origin}${window.location.pathname}`);
  lines.push(`results liff: ${liffIdFor('results') || '(empty)'}`);
  lines.push(`manage liff: ${liffIdFor('manage') || '(empty)'}`);
  return lines.join('\n');
}
