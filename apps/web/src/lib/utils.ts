import clsx, { type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** One name per line; trims, drops blanks and duplicates. */
export function parseGuestNames(rawText: string): string[] {
  const names = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return [...new Set(names)];
}

export function formatThaiDate(isoDate: string | null, withTime = false): string {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
