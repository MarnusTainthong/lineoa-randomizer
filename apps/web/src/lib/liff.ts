import liff from '@line/liff';

const FALLBACK_LIFF_ID = import.meta.env.VITE_LIFF_ID ?? '';
const LIFF_IDS = {
  results: import.meta.env.VITE_LIFF_ID_RESULTS || FALLBACK_LIFF_ID,
  manage: import.meta.env.VITE_LIFF_ID_MANAGE || FALLBACK_LIFF_ID,
  join: import.meta.env.VITE_LIFF_ID_JOIN || FALLBACK_LIFF_ID,
} as const;

type LiffIds = { results: string; manage: string; join: string };

export type LiffApp = keyof typeof LIFF_IDS;

export const isDevAuthEnabled = import.meta.env.VITE_DEV_AUTH === 'true';

/** Both web flags on: either LIFF opens `/` instead of its menu. */
export const openMainPage = isDevAuthEnabled && import.meta.env.VITE_SHOW_ERRORS === 'true';

/** Each rich-menu LIFF owns its path. A code such as `/join/482193` stays on the join LIFF. */
export function liffAppForPath(pathname: string): LiffApp {
  if (pathname.startsWith('/manage')) return 'manage';
  if (pathname.startsWith('/join')) return 'join';
  return 'results';
}

/**
 * LINE opens the site root with the real path in `liff.state` before `liff.init`
 * rewrites the URL. The id passed to init must match that LIFF, or LINE reports
 * "Invalid LIFF ID".
 */
export function liffAppForLocation(pathname: string, search = ''): LiffApp {
  const state = new URLSearchParams(search).get('liff.state');
  const fromState = state?.split('?')[0];
  const path = fromState ? (fromState.startsWith('/') ? fromState : `/${fromState}`) : pathname;
  return liffAppForPath(path);
}

/** LINE puts the opened LIFF id in `context_token` before our code runs. */
export function liffIdFromContextToken(token: string | null): string | null {
  const segment = token?.split('.')[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload: unknown = JSON.parse(atob(padded));
    if (typeof payload !== 'object' || payload === null || !('liffId' in payload)) return null;
    return typeof payload.liffId === 'string' ? payload.liffId : null;
  } catch {
    return null;
  }
}

export function openedLiffId(search: string, hash: string): string | null {
  const fromHash = new URLSearchParams(hash.replace(/^#/, '')).get('context_token');
  const fromSearch = new URLSearchParams(search).get('context_token');
  return liffIdFromContextToken(fromHash ?? fromSearch);
}

/** Prefer the LIFF LINE actually opened. Path is only a fallback before that token exists. */
export function liffAppForOpenedLiff(
  openedId: string | null,
  pathname: string,
  search = '',
  ids: LiffIds = LIFF_IDS,
): LiffApp {
  const opened = appForUniqueLiffId(openedId, ids);
  if (opened) return opened;
  return liffAppForLocation(pathname, search);
}

/**
 * Page the rich menu should open.
 * An endpoint path such as `/results` stays as it is.
 * On `/`, `liff.state` is the path from the LIFF URL. If that is missing,
 * the opened LIFF id picks `/results`, `/manage`, or `/join`.
 * When both dev flags are on, any menu home opens `/`.
 */
export function entryPathForLiffOpen(
  pathname: string,
  search: string,
  openedId: string | null,
  ids: LiffIds = LIFF_IDS,
  landOnMain = false,
): string {
  if (landOnMain && isLiffMenuHome(pathname)) return '/';
  if (pathname !== '/') return `${pathname}${search}`;

  const fromState = pathFromLiffState(search);
  if (fromState) return fromState;

  const app = appForUniqueLiffId(openedId, ids);
  if (app === 'manage') return '/manage';
  if (app === 'join') return '/join';
  if (app === 'results') return '/results';
  return `${pathname}${search}`;
}

/** Rich-menu homes. Deeper paths such as `/manage/:id` stay put. */
function isLiffMenuHome(pathname: string): boolean {
  return pathname === '/' || pathname === '/results' || pathname === '/manage' || pathname === '/join';
}

function pathFromLiffState(search: string): string | null {
  const state = new URLSearchParams(search).get('liff.state');
  if (!state) return null;
  const path = state.startsWith('/') ? state : `/${state}`;
  const pathOnly = path.split('?')[0];
  if (!pathOnly || pathOnly === '/') return null;
  return path;
}

/** Null when the opened id matches more than one menu — the path has to decide. */
function appForUniqueLiffId(openedId: string | null, ids: LiffIds): LiffApp | null {
  if (!openedId) return null;
  const matches = (['results', 'manage', 'join'] as const).filter(
    (app) => ids[app].length > 0 && openedId === ids[app],
  );
  const match = matches[0];
  return matches.length === 1 && match ? match : null;
}

function currentLiffApp(): LiffApp {
  return liffAppForOpenedLiff(
    openedLiffId(window.location.search, window.location.hash),
    window.location.pathname,
    window.location.search,
  );
}

/** One id only. A failed liff.init() leaves LINE's "Invalid LIFF ID" screen up. */
function liffIdToInit(): string {
  return openedLiffId(window.location.search, window.location.hash) || liffIdFor(currentLiffApp());
}

export function liffIdFor(app: LiffApp): string {
  return LIFF_IDS[app];
}

export function hasLiffId(app: LiffApp = currentLiffApp()): boolean {
  return liffIdFor(app).length > 0;
}

/** Opens that LIFF on its home path. Null when the id is not configured. */
export function liffEntryUrl(app: LiffApp): string | null {
  const liffId = liffIdFor(app);
  if (!liffId) return null;
  const path = app === 'manage' ? '/manage' : app === 'join' ? '/join' : '/results';
  return `https://liff.line.me/${liffId}${path}`;
}

let initializedLiffId = '';
let initializingId = '';
let initPromise: Promise<void> | null = null;

export function initLiff(app?: LiffApp): Promise<void> {
  const liffId = app ? liffIdFor(app) : liffIdToInit();
  if (!liffId) return Promise.reject(new Error('LIFF ID is not configured'));
  if (initializedLiffId) return Promise.resolve();
  if (initPromise && initializingId === liffId) return initPromise;
  initializingId = liffId;
  initPromise = liff
    .init({ liffId })
    .then(() => {
      initializedLiffId = liffId;
      // React Router reads the URL once, and it misses LINE's later replaceState.
      applyLiffEntryPath();
    })
    .catch((error: unknown) => {
      initPromise = null;
      initializingId = '';
      throw error;
    });
  return initPromise;
}

/** Moves `/` to the rich-menu page once we know which LIFF opened. */
function applyLiffEntryPath(): void {
  const openedId = liff.id || initializedLiffId || openedLiffId(window.location.search, window.location.hash);
  const target = entryPathForLiffOpen(window.location.pathname, window.location.search, openedId);
  const current = `${window.location.pathname}${window.location.search}`;
  if (target === current) return;
  window.history.replaceState(window.history.state, '', target);
}

/**
 * Run before the React router is created. `liff.init` rewrites `liff.state`
 * after the router would already have captured `/`.
 */
export async function prepareLiffEntry(): Promise<void> {
  if (openMainPage) {
    const target = entryPathForLiffOpen(
      window.location.pathname,
      window.location.search,
      openedLiffId(window.location.search, window.location.hash),
      LIFF_IDS,
      true,
    );
    const current = `${window.location.pathname}${window.location.search}`;
    if (target !== current || window.location.hash) {
      window.history.replaceState(window.history.state, '', target);
    }
    return;
  }
  if (isDevAuthEnabled || !hasLiffId()) return;
  await initLiff();
}

/** Endpoint path only. Query and hash (liff.state, OAuth code) make LINE's in-app browser go blank. */
function loginRedirectUri(): string {
  const openedId = liff.id || initializedLiffId || openedLiffId(window.location.search, window.location.hash);
  const target = entryPathForLiffOpen(window.location.pathname, window.location.search, openedId);
  const path = target.split('?')[0] || '/';
  return `${window.location.origin}${path}`;
}

export async function getLiffIdToken(): Promise<string | null> {
  await initLiff();
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: loginRedirectUri() });
    return null; // page navigates away
  }
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error('LINE did not return an ID token');
  return idToken;
}

export function isInLineApp(): boolean {
  return initializedLiffId.length > 0 && liff.isInClient();
}

/** Sends a message through the user's own LINE (not a push), if available. Returns false if unsupported. */
export async function shareTextToChat(text: string): Promise<boolean> {
  await initLiff();
  if (!liff.isApiAvailable('shareTargetPicker')) return false;
  await liff.shareTargetPicker([{ type: 'text', text }]);
  return true;
}

export async function isOaFriend(): Promise<boolean> {
  await initLiff();
  try {
    return (await liff.getFriendship()).friendFlag;
  } catch {
    return true; // bot link not configured; do not nag
  }
}
