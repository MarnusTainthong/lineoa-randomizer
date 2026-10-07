import type { AuthResponse } from '@secret-santa/shared';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { devApi, readDevIdentity, REAL_ACCOUNT_IDENTITY } from '../features/dev/dev-api';
import { ApiError, apiFetch, setAccessToken } from '../lib/api-client';
import { getLiffIdToken, hasLiffId, isDevAuthEnabled } from '../lib/liff';
import { DevIdentityPicker } from '../features/dev/dev-toolbar';
import { Button } from '../components/ui/button';
import { TH } from '../lib/th';

type CurrentUser = AuthResponse['user'];
type AuthState =
  | { status: 'loading' }
  | { status: 'needs-identity' }
  | { status: 'error'; message: string }
  | { status: 'ready'; user: CurrentUser };

const AuthContext = createContext<CurrentUser | null>(null);

export function useCurrentUser(): CurrentUser {
  const user = useContext(AuthContext);
  if (!user) throw new Error('useCurrentUser must be used inside a ready AuthProvider');
  return user;
}

async function authenticate(): Promise<AuthState> {
  const devIdentity = isDevAuthEnabled ? readDevIdentity() : null;

  if (devIdentity && devIdentity !== REAL_ACCOUNT_IDENTITY) {
    const auth = await devApi.loginAsMockUser(devIdentity);
    setAccessToken(auth.accessToken);
    return { status: 'ready', user: auth.user };
  }
  if (isDevAuthEnabled && !devIdentity && !hasLiffId) return { status: 'needs-identity' };

  const idToken = await getLiffIdToken();
  if (!idToken) return { status: 'loading' }; // redirecting to LINE login
  const auth = await apiFetch<AuthResponse>('/auth/line', { method: 'POST', body: { idToken } });
  setAccessToken(auth.accessToken);
  return { status: 'ready', user: auth.user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    authenticate()
      .then((nextState) => !isCancelled && setState(nextState))
      .catch((error: unknown) => {
        if (isCancelled) return;
        const message = error instanceof ApiError || error instanceof Error ? error.message : TH.common.errorTitle;
        setState({ status: 'error', message });
      });
    return () => {
      isCancelled = true;
    };
  }, [attempt]);

  if (state.status === 'needs-identity') return <DevIdentityPicker />;
  if (state.status === 'error') {
    return (
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-medium">{TH.common.errorTitle}</p>
        <p className="text-on-surface-variant">{state.message}</p>
        <Button onClick={() => setAttempt((count) => count + 1)}>{TH.common.retry}</Button>
        {isDevAuthEnabled && <DevIdentityPicker compact />}
      </div>
    );
  }
  if (state.status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center text-on-surface-variant">{TH.common.loading}</div>;
  }
  return <AuthContext.Provider value={state.user}>{children}</AuthContext.Provider>;
}
