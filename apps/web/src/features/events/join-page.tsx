import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { LoadingIndicator, PanelSkeleton, QueryBoundary } from '../../components/ui/states';
import { isOaFriend } from '../../lib/liff';
import { TH } from '../../lib/th';
import { eventsApi } from './events-api';
import { useJoinEvent } from './use-events';

export function JoinPage() {
  const { inviteCode = '' } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const joinEvent = useJoinEvent();
  const [joinedEventId, setJoinedEventId] = useState<string | null>(null);
  const previewQuery = useQuery({
    queryKey: ['invite', inviteCode],
    queryFn: () => eventsApi.previewInvite(inviteCode),
  });
  // Suggest adding the OA so the Rich Menu shows up. Dev/mock sessions have no LIFF, so ignore failures.
  const friendQuery = useQuery({
    queryKey: ['oa-friend'],
    queryFn: isOaFriend,
    enabled: joinedEventId !== null,
    retry: false,
  });

  return (
    <Page title={TH.join.title}>
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
                  joinEvent.mutate(inviteCode, {
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
