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

export function liffIdFor(app: LiffApp): string {
  return LIFF_IDS[app];
}

export function hasLiffId(app: LiffApp = liffAppForPath(window.location.pathname)): boolean {
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

export async function initLiff(app: LiffApp = liffAppForPath(window.location.pathname)): Promise<void> {
  const liffId = liffIdFor(app);
  if (!liffId) throw new Error('LIFF ID is not configured');
  if (initializedLiffId === liffId) return;
  await liff.init({ liffId });
  initializedLiffId = liffId;
}

export async function getLiffIdToken(): Promise<string | null> {
  await initLiff();
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
    return null; // page navigates away
  }
  return liff.getIDToken();
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
