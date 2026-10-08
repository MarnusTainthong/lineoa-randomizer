import { describe, expect, it } from 'vitest';
import {
  entryPathForLiffOpen,
  liffAppForLocation,
  liffAppForOpenedLiff,
  liffIdFromContextToken,
  openedLiffId,
} from './liff';

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

describe('openedLiffId', () => {
  it('reads the LIFF id LINE opened from the hash', () => {
    expect(liffIdFromContextToken(contextHash('manage-id').replace('#context_token=', ''))).toBe('manage-id');
    expect(openedLiffId('', contextHash('manage-id'))).toBe('manage-id');
    expect(openedLiffId('', '')).toBeNull();
  });
});

describe('liffAppForOpenedLiff', () => {
  it('follows the opened LIFF when the path still belongs to the other app', () => {
    expect(liffAppForOpenedLiff('manage-id', '/results', '', IDS)).toBe('manage');
    expect(liffAppForOpenedLiff('results-id', '/manage', '', IDS)).toBe('results');
  });
});

describe('entryPathForLiffOpen', () => {
  it('opens the results page from the results rich menu', () => {
    expect(entryPathForLiffOpen('/', '', 'results-id', IDS)).toBe('/results');
    expect(entryPathForLiffOpen('/', '?liff.state=%2Fresults', 'results-id', IDS)).toBe('/results');
  });

  it('opens the manage page from the manage rich menu', () => {
    expect(entryPathForLiffOpen('/', '', 'manage-id', IDS)).toBe('/manage');
    expect(entryPathForLiffOpen('/', '?liff.state=%2Fmanage', 'manage-id', IDS)).toBe('/manage');
  });

  it('keeps a page LINE already put in the path', () => {
    expect(entryPathForLiffOpen('/results', '', 'results-id', IDS)).toBe('/results');
    expect(entryPathForLiffOpen('/manage/event-1', '', 'manage-id', IDS)).toBe('/manage/event-1');
  });

  it('stays on the landing page when one LIFF id is shared by both menus', () => {
    const shared = { results: 'same-id', manage: 'same-id' };
    expect(entryPathForLiffOpen('/', '', 'same-id', shared)).toBe('/');
  });
});
