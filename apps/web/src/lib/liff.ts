import liff from '@line/liff';

const FALLBACK_LIFF_ID = import.meta.env.VITE_LIFF_ID ?? '';
const LIFF_IDS = {
  results: import.meta.env.VITE_LIFF_ID_RESULTS || FALLBACK_LIFF_ID,
  manage: import.meta.env.VITE_LIFF_ID_MANAGE || FALLBACK_LIFF_ID,
} as const;

export type LiffApp = keyof typeof LIFF_IDS;

export const isDevAuthEnabled = import.meta.env.VITE_DEV_AUTH === 'true';

/** `/manage` belongs to the manage LIFF. Results and join use the results LIFF. */
export function liffAppForPath(pathname: string): LiffApp {
  return pathname.startsWith('/manage') ? 'manage' : 'results';
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
  ids: { results: string; manage: string } = LIFF_IDS,
): LiffApp {
  if (openedId && openedId === ids.manage) return 'manage';
  if (openedId && openedId === ids.results) return 'results';
  return liffAppForLocation(pathname, search);
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
  const path = app === 'manage' ? '/manage' : '/results';
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
    })
    .catch((error: unknown) => {
      initPromise = null;
      initializingId = '';
      throw error;
    });
  return initPromise;
}

/** Endpoint path only. Query and hash (liff.state, OAuth code) make LINE's in-app browser go blank. */
function loginRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`;
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
