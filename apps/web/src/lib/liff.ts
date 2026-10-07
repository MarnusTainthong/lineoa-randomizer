import liff from '@line/liff';

const LIFF_ID = import.meta.env.VITE_LIFF_ID ?? '';

export const isDevAuthEnabled = import.meta.env.VITE_DEV_AUTH === 'true';
export const hasLiffId = LIFF_ID.length > 0;

let isLiffInitialized = false;
export async function initLiff(): Promise<void> {
  if (isLiffInitialized) return;
  await liff.init({ liffId: LIFF_ID });
  isLiffInitialized = true;
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
  return isLiffInitialized && liff.isInClient();
}

/** Invite link that opens this LIFF app on the join page. */
export function buildInviteUrl(inviteCode: string): string {
  return `https://liff.line.me/${LIFF_ID}/join/${inviteCode}`;
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
