import { isInviteCode, normalizeInviteCode } from '@line-oa-randomizer/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { TextField } from '../../components/ui/field';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { LoadingIndicator, PanelSkeleton, QueryBoundary } from '../../components/ui/states';
import { ApiError } from '../../lib/api-client';
import { isOaFriend } from '../../lib/liff';
import { TH } from '../../lib/th';
import { eventsApi } from './events-api';
import { useJoinEvent } from './use-events';

export function JoinPage() {
  const { inviteCode = '' } = useParams();
  const code = normalizeInviteCode(inviteCode);
  if (!code) return <JoinCodeForm />;
  return <JoinRoom code={code} />;
}

function JoinRoom({ code }: { code: string }) {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const joinEvent = useJoinEvent();
  const [joinedEventId, setJoinedEventId] = useState<string | null>(null);
  const previewQuery = useQuery({
    queryKey: ['invite', code],
    queryFn: () => eventsApi.previewInvite(code),
  });
  // Suggest adding the OA so the Rich Menu shows up. Dev/mock sessions have no LIFF, so ignore failures.
  const friendQuery = useQuery({
    queryKey: ['oa-friend'],
    queryFn: isOaFriend,
    enabled: joinedEventId !== null,
    retry: false,
  });

  return (
    <Page title={TH.join.title} backTo="/join">
      <QueryBoundary query={previewQuery} pending={<PanelSkeleton />}>
        {(preview) => (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <h2 className="text-2xl font-medium">{preview.name}</h2>
            {preview.status !== 'OPEN' && !preview.isAlreadyJoined && (
              <p className="text-on-surface-variant">{TH.join.closed}</p>
            )}
            {preview.isAlreadyJoined && joinedEventId === null && (
              <>
                <p className="text-on-surface-variant">{TH.join.already}</p>
                <Link to={`/results/${preview.eventId}`}>
                  <Button tabIndex={-1}>{TH.nav.results}</Button>
                </Link>
              </>
            )}
            {!preview.isAlreadyJoined && preview.status === 'OPEN' && joinedEventId === null && (
              <Button
                loading={joinEvent.isPending}
                onClick={() =>
                  joinEvent.mutate(code, {
                    onSuccess: ({ eventId }) => setJoinedEventId(eventId),
                    onError: (error) => showSnackbar(error.message),
                  })
                }
              >
                {TH.join.action}
              </Button>
            )}
            {joinedEventId && friendQuery.isPending && <LoadingIndicator />}
            {joinedEventId && !friendQuery.isPending && (
              <>
                {friendQuery.data === false && (
                  <p className="text-sm text-on-surface-variant">{TH.join.addFriend}</p>
                )}
                <Button onClick={() => navigate(`/results/${joinedEventId}`, { replace: true })}>
                  {TH.nav.results}
                </Button>
              </>
            )}
          </div>
        )}
      </QueryBoundary>
    </Page>
  );
}

function JoinCodeForm() {
  const navigate = useNavigate();
  const joinEvent = useJoinEvent();
  const [rawCode, setRawCode] = useState('');
  const [rejected, setRejected] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const code = normalizeInviteCode(rawCode);

  return (
    <Page title={TH.join.title} tone="brand" icon="key">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isInviteCode(code) || pending) return;
          setPending(true);
          setRoomError(null);
          void eventsApi
            .previewInvite(code)
            .then(async (preview) => {
              if (preview.isAlreadyJoined) {
                setRoomError(TH.join.already);
                return;
              }
              if (preview.status !== 'OPEN') {
                setRoomError(TH.join.closed);
                return;
              }
              await joinEvent.mutateAsync(code);
              navigate(`/results/${preview.eventId}`, { replace: true });
            })
            .catch((error: unknown) => {
              setRoomError(
                error instanceof ApiError && error.status === 404
                  ? TH.join.notFound
                  : error instanceof Error
                    ? error.message
                    : TH.common.errorTitle,
              );
            })
            .finally(() => setPending(false));
        }}
      >
        <p className="text-sm text-on-surface-variant">{TH.join.hint}</p>
        <TextField
          label={TH.join.codeLabel}
          value={rawCode}
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={6}
          placeholder={TH.join.placeholder}
          error={rejected ? TH.join.invalid : (roomError ?? undefined)}
          className="text-center text-2xl font-bold tracking-[0.3em]"
          onChange={(event) => {
            const value = event.target.value.toUpperCase();
            setRejected(/[^A-Z0-9\s]/.test(value));
            setRoomError(null);
            setRawCode(value.replace(/[^A-Z0-9]/g, '').slice(0, 6));
          }}
        />
        <Button type="submit" className="w-full" loading={pending} disabled={!isInviteCode(code)}>
          {TH.join.action}
        </Button>
      </form>
    </Page>
  );
}
