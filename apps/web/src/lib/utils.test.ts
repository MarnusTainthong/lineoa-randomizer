import { describe, expect, it } from 'vitest';
import { parseGuestNames } from './utils';

describe('parseGuestNames', () => {
  it('splits by line, trims, and drops blanks and duplicates', () => {
    expect(parseGuestNames(' สมชาย \n\nมาลี\r\nสมชาย\n  ')).toEqual(['สมชาย', 'มาลี']);
  });

  it('returns an empty list for empty input', () => {
    expect(parseGuestNames('   \n ')).toEqual([]);
  });
});
