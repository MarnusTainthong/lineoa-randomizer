import { useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../../app/auth-provider';
import { Button } from '../../components/ui/button';
import { useSnackbar } from '../../components/ui/snackbar';
import { isDevAuthEnabled } from '../../lib/liff';
import { TH } from '../../lib/th';
import { devApi } from './dev-api';

/** Slim bar on inner pages so a test session still shows who is logged in. */
export function DevToolbar() {
  const user = useCurrentUser();
  const showSnackbar = useSnackbar();
  const { pathname } = useLocation();
  const eventId = /\/manage\/([^/]+)/.exec(pathname)?.[1];
  const addMockParticipants = useMutation({
    mutationFn: (count: number) => devApi.addMockParticipants(eventId as string, count),
    onSuccess: () => window.location.reload(),
    onError: (error) => showSnackbar(error.message),
  });

  if (!isDevAuthEnabled) return null;
  const canAddMocks = Boolean(eventId && eventId !== 'new');
  return (
    <div className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container/95 text-sm backdrop-blur-md">
      <div className="flex h-11 items-center gap-2 px-4">
        <p className="min-w-0 flex-1 truncate">
          <span className="text-on-surface-variant">{TH.dev.loginAs} </span>
          <span className="font-semibold">{user.displayName}</span>
        </p>
        <Link to="/" className="shrink-0 font-semibold text-primary">
          {TH.dev.home}
        </Link>
      </div>
      {canAddMocks && (
        <div className="px-4 pb-2">
          <Button
            variant="tonal"
            className="h-9 min-h-0 w-full px-3 text-xs"
            onClick={() => addMockParticipants.mutate(3)}
            loading={addMockParticipants.isPending}
          >
            {TH.dev.addMocks}
          </Button>
        </div>
      )}
    </div>
  );
}
