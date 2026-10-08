import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/dialog';
import { ErrorState, ListSkeleton } from '../../components/ui/states';
import { useSnackbar } from '../../components/ui/snackbar';
import { TH } from '../../lib/th';
import { cn } from '../../lib/utils';
import { devApi, selectDevIdentity } from './dev-api';
import { DevOnlyBanner } from './dev-only-banner';

const AVATAR_STYLES = [
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-on-surface text-surface',
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
];

function initial(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toUpperCase() : '?';
}

function avatarStyle(name: string): string {
  const code = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_STYLES[code % AVATAR_STYLES.length] ?? 'bg-primary text-on-primary';
}

function UserRow({ name, onSelect }: { name: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="state-layer flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          avatarStyle(name),
        )}
        aria-hidden
      >
        {initial(name)}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
      <span className="material-symbols-outlined text-on-surface-variant" aria-hidden>
        chevron_right
      </span>
    </button>
  );
}

/** Dev entry: pick an existing mock user, or create the next user-N. */
export function UserPickerPage() {
  const queryClient = useQueryClient();
  const showSnackbar = useSnackbar();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isConfirmingCreate, setIsConfirmingCreate] = useState(false);
  const mockUsersQuery = useQuery({
    queryKey: ['dev', 'mock-users'],
    queryFn: devApi.listMockUsers,
  });
  const createMockUser = useMutation({
    mutationFn: () => devApi.createMockUser(),
    onSuccess: (user) => {
      setCreatedId(user.id);
      void queryClient.invalidateQueries({ queryKey: ['dev', 'mock-users'] });
    },
    onError: (error) => showSnackbar(error.message),
  });

  useEffect(() => {
    if (!createdId) return;
    document.getElementById(`mock-user-${createdId}`)?.scrollIntoView({ block: 'nearest' });
  }, [createdId, mockUsersQuery.data]);

  const users = mockUsersQuery.data ?? [];

  return (
    <div className="app-background mx-auto flex h-dvh max-w-[480px] flex-col">
      <header className="shrink-0 px-6 pb-5 pt-8">
        <p className="text-sm font-medium text-on-surface-variant">{TH.appName}</p>
        <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight">{TH.dev.pickIdentity}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{TH.dev.pickHint}</p>
      </header>
      <DevOnlyBanner />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5">
        {mockUsersQuery.isPending && <ListSkeleton />}
        {mockUsersQuery.error && (
          <ErrorState error={mockUsersQuery.error} onRetry={() => void mockUsersQuery.refetch()} />
        )}
        {mockUsersQuery.data && (
          <ul className="divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
            {users.map((user) => (
              <li key={user.id} id={`mock-user-${user.id}`}>
                <UserRow name={user.displayName} onSelect={() => selectDevIdentity(user.id)} />
              </li>
            ))}
            {users.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-on-surface-variant">
                {TH.dev.emptyUsers}
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-outline-variant bg-surface-container px-5 py-4">
        <Button className="w-full" icon="person_add" onClick={() => setIsConfirmingCreate(true)}>
          {TH.dev.createMock}
        </Button>
      </div>
      {isConfirmingCreate && (
        <ConfirmDialog
          title={TH.dev.createMock}
          message={TH.dev.createConfirm}
          confirmLabel={TH.dev.createMock}
          isBusy={createMockUser.isPending}
          onClose={() => {
            if (!createMockUser.isPending) setIsConfirmingCreate(false);
          }}
          onConfirm={() =>
            createMockUser.mutate(undefined, {
              onSuccess: () => setIsConfirmingCreate(false),
            })
          }
        />
      )}
    </div>
  );
}
