import { describe, expect, it } from 'vitest';
import { liffAppForLocation, liffAppForOpenedLiff, liffIdFromLocationHash } from './liff';

const IDS = { results: 'results-id', manage: 'manage-id' };

function contextHash(liffId: string): string {
  const body = btoa(JSON.stringify({ liffId })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `#context_token=header.${body}.sig`;
}

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

describe('liffIdFromLocationHash', () => {
  it('reads the LIFF id LINE opened', () => {
    expect(liffIdFromLocationHash(contextHash('manage-id'))).toBe('manage-id');
    expect(liffIdFromLocationHash('')).toBeNull();
  });
});

describe('liffAppForOpenedLiff', () => {
  it('follows the opened LIFF when the path still belongs to the other app', () => {
    expect(liffAppForOpenedLiff('manage-id', '/results', '', IDS)).toBe('manage');
    expect(liffAppForOpenedLiff('results-id', '/manage', '', IDS)).toBe('results');
  });
});
