import { formatInviteCode, isInviteCode, normalizeInviteCode } from '@line-oa-randomizer/shared';
import { createInviteCode } from './invite-code';

describe('createInviteCode', () => {
  it('is always six letters or digits', () => {
    for (let index = 0; index < 40; index += 1) {
      expect(createInviteCode()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });
});

describe('invite code text', () => {
  it('uppercases and groups a six-character code', () => {
    expect(normalizeInviteCode('ab3 k9q')).toBe('AB3K9Q');
    expect(formatInviteCode('ab3k9q')).toBe('AB3 K9Q');
    expect(isInviteCode('ab3 k9q')).toBe(true);
  });

  it('rejects symbols and the wrong length', () => {
    expect(isInviteCode('AB-C12')).toBe(false);
    expect(isInviteCode('ABC12')).toBe(false);
    expect(isInviteCode('ABCD123')).toBe(false);
  });
});
