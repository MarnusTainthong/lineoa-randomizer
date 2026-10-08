import { randomInt } from 'node:crypto';

/** Six digits, including leading zeros. Easy to read out, unique via the database. */
export function createInviteCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
