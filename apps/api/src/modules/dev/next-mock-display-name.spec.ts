import { nextMockDisplayName } from './dev.service';

describe('nextMockDisplayName', () => {
  it('starts at user-1 when nothing is taken', () => {
    expect(nextMockDisplayName([])).toBe('user-1');
  });

  it('continues past names that already exist', () => {
    expect(nextMockDisplayName(['สมชาย', 'user-1', 'user-2'])).toBe('user-3');
  });

  it('fills the first gap', () => {
    expect(nextMockDisplayName(['user-1', 'user-3'])).toBe('user-2');
  });
});
