import { randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Six letters or digits. Unique via the database. */
export function createInviteCode(): string {
  return Array.from({ length: 6 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join('');
}
