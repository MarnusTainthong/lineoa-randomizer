import { describe, expect, it } from 'vitest';
import { liffAppForLocation } from './liff';

describe('liffAppForLocation', () => {
  it('uses the manage LIFF when LINE has not applied liff.state yet', () => {
    expect(liffAppForLocation('/', '?liff.state=%2Fmanage')).toBe('manage');
  });

  it('uses the results LIFF for the results path and the site root', () => {
    expect(liffAppForLocation('/results')).toBe('results');
    expect(liffAppForLocation('/', '?liff.state=%2Fresults')).toBe('results');
  });

  it('reads the path after LINE has rewritten the URL', () => {
    expect(liffAppForLocation('/manage')).toBe('manage');
    expect(liffAppForLocation('/join/DEMO1234')).toBe('results');
  });
});
