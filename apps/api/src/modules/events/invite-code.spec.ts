import { formatInviteCode, normalizeInviteCode } from '@line-oa-randomizer/shared';
import { createInviteCode } from './invite-code';

describe('createInviteCode', () => {
  it('is always six digits', () => {
    for (let index = 0; index < 40; index += 1) {
      expect(createInviteCode()).toMatch(/^\d{6}$/);
    }
  });
});

describe('invite code text', () => {
  it('treats a spaced code as the same six digits', () => {
    expect(normalizeInviteCode('482 193')).toBe('482193');
    expect(formatInviteCode('482193')).toBe('482 193');
  });

  it('keeps a known demo code readable', () => {
    expect(normalizeInviteCode('demo1234')).toBe('DEMO1234');
    expect(formatInviteCode('DEMO1234')).toBe('DEMO1234');
  });
});
