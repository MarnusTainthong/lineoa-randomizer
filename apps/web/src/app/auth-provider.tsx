import type { AuthResponse } from '@line-oa-randomizer/shared';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/ui/button';
import { LoadingIndicator } from '../components/ui/states';
import {
  clearDevIdentity,
  devApi,
  readDevIdentity,
  REAL_ACCOUNT_IDENTITY,
} from '../features/dev/dev-api';
import { UserPickerPage } from '../features/dev/user-picker-page';
import { ApiError, apiFetch, setAccessToken } from '../lib/api-client';
import { formatErrorDetail } from '../lib/error-detail';
import { getLiffIdToken, isDevAuthEnabled } from '../lib/liff';
import { TH } from '../lib/th';

type CurrentUser = AuthResponse['user'];
type AuthState =
  | { status: 'loading' }
  | { status: 'needs-identity' }
  | { status: 'error'; message: string; detail: string | null }
  | { status: 'ready'; user: CurrentUser };

const AuthContext = createContext<CurrentUser | null>(null);

export function useCurrentUser(): CurrentUser {
  const user = useContext(AuthContext);
  if (!user) throw new Error('useCurrentUser must be used inside a ready AuthProvider');
  return user;
}

async function authenticate(): Promise<AuthState> {
  if (isDevAuthEnabled) {
    const devIdentity = readDevIdentity();
    if (!devIdentity) return { status: 'needs-identity' };
    if (devIdentity !== REAL_ACCOUNT_IDENTITY) {
      const auth = await devApi.loginAsMockUser(devIdentity);
      setAccessToken(auth.accessToken);
      return { status: 'ready', user: auth.user };
    }
  }

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
        const message =
          error instanceof ApiError || error instanceof Error
            ? error.message
            : TH.common.errorTitle;
        setState({ status: 'error', message, detail: formatErrorDetail(error) });
      });
    return () => {
      isCancelled = true;
    };
  }, [attempt]);

  if (state.status === 'needs-identity') return <UserPickerPage />;
  if (state.status === 'error') {
    return (
      <div className="app-background mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-medium">{TH.common.errorTitle}</p>
        <p className="text-on-surface-variant">{state.message}</p>
        {state.detail && (
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-all text-left text-xs text-on-surface-variant">
            {state.detail}
          </pre>
        )}
        <Button onClick={() => setAttempt((count) => count + 1)}>{TH.common.retry}</Button>
        {isDevAuthEnabled && (
          <Button
            variant="text"
            onClick={() => {
              clearDevIdentity();
              setAttempt((count) => count + 1);
            }}
          >
            {TH.dev.switchUser}
          </Button>
        )}
      </div>
    );
  }
  if (state.status === 'loading') {
    return (
      <div className="app-background mx-auto flex min-h-screen max-w-[480px] items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }
  return <AuthContext.Provider value={state.user}>{children}</AuthContext.Provider>;
}
