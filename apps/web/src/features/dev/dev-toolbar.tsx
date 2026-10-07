import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { useSnackbar } from '../../components/ui/snackbar';
import { hasLiffId, isDevAuthEnabled } from '../../lib/liff';
import { TH } from '../../lib/th';
import { devApi, readDevIdentity, REAL_ACCOUNT_IDENTITY, writeDevIdentity } from './dev-api';

function switchIdentity(identity: string): void {
  writeDevIdentity(identity);
  window.location.reload();
}

function useMockUsers() {
  return useQuery({ queryKey: ['dev', 'mock-users'], queryFn: devApi.listMockUsers });
}

/** Identity dropdown + create button. Shared by the toolbar and the "pick a user" start screen. */
function IdentityControls() {
  const queryClient = useQueryClient();
  const mockUsersQuery = useMockUsers();
  const createMockUser = useMutation({
    mutationFn: () => devApi.createMockUser(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dev', 'mock-users'] }),
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={TH.dev.actAs}
        className="min-h-12 rounded-xl border border-outline bg-surface px-3 text-sm"
        value={readDevIdentity() ?? ''}
        onChange={(event) => event.target.value && switchIdentity(event.target.value)}
      >
        <option value="" disabled>{TH.dev.actAs}…</option>
        {hasLiffId && <option value={REAL_ACCOUNT_IDENTITY}>{TH.dev.realAccount}</option>}
        {mockUsersQuery.data?.map((user) => (
          <option key={user.id} value={user.id}>{user.displayName}</option>
        ))}
      </select>
      <Button variant="tonal" icon="person_add" onClick={() => createMockUser.mutate()} disabled={createMockUser.isPending}>
        {TH.dev.createMock}
      </Button>
    </div>
  );
}

/** Start screen when dev auth is on and no identity has been chosen in this tab. */
export function DevIdentityPicker({ compact = false }: { compact?: boolean }) {
  if (compact) return <IdentityControls />;
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center gap-4 p-6">
      <p className="text-lg font-medium">{TH.dev.pickIdentity}</p>
      <IdentityControls />
    </div>
  );
}

/** Floating bar, dev builds only. Identity is stored per tab so several tabs can be different users. */
export function DevToolbar() {
  const showSnackbar = useSnackbar();
  const eventId = /\/manage\/([^/]+)/.exec(window.location.pathname)?.[1];
  const addMockParticipants = useMutation({
    mutationFn: (count: number) => devApi.addMockParticipants(eventId as string, count),
    onSuccess: () => window.location.reload(),
    onError: (error) => showSnackbar(error.message),
  });

  if (!isDevAuthEnabled) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[480px] items-center gap-2 overflow-x-auto bg-tertiary-container px-3 py-1 text-xs text-on-surface">
      <span className="shrink-0 rounded bg-secondary px-2 py-0.5 font-medium text-on-secondary">{TH.dev.badge}</span>
      <IdentityControls />
      {eventId && eventId !== 'new' && (
        <Button variant="outlined" icon="group_add" onClick={() => addMockParticipants.mutate(3)}>
          {TH.dev.addMocks} (3)
        </Button>
      )}
    </div>
  );
}
