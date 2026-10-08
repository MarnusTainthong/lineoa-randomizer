import { normalizeInviteCode } from '@line-oa-randomizer/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { TextField } from '../../components/ui/field';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { LoadingIndicator, PanelSkeleton, QueryBoundary } from '../../components/ui/states';
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
  const [rawCode, setRawCode] = useState('');
  const code = normalizeInviteCode(rawCode);

  return (
    <Page title={TH.join.title} backTo="/results">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code) navigate(`/join/${code}`);
        }}
      >
        <p className="text-sm text-on-surface-variant">{TH.join.hint}</p>
        <TextField
          label={TH.join.codeLabel}
          value={rawCode}
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          placeholder="482 193"
          className="text-center text-2xl font-bold tracking-[0.3em]"
          onChange={(event) => setRawCode(event.target.value)}
        />
        <Button type="submit" className="w-full" disabled={code.length === 0}>
          {TH.join.action}
        </Button>
      </form>
    </Page>
  );
}
