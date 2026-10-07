import type { EventDetail, ParticipantView } from '@line-oa-randomizer/shared';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/dialog';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { QueryBoundary } from '../../components/ui/states';
import { Switch } from '../../components/ui/switch';
import { shareTextToChat } from '../../lib/liff';
import { TH } from '../../lib/th';
import { AddGuestsDialog } from './add-guests-dialog';
import { EventStatusBlock } from './feasibility-badge';
import { ParticipantList } from './participant-list';
import { useEventDetail, useRemoveParticipant, useUpdateEvent } from './use-events';

function useShareToChat() {
  const showSnackbar = useSnackbar();
  return async (text: string) => {
    try {
      const isShared = await shareTextToChat(text);
      if (!isShared) {
        await navigator.clipboard.writeText(text);
        showSnackbar('คัดลอกข้อความแล้ว');
      }
    } catch {
      showSnackbar(TH.common.errorTitle);
    }
  };
}

function EventDetailContent({ event }: { event: EventDetail }) {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const shareToChat = useShareToChat();
  const updateEvent = useUpdateEvent(event.id);
  const removeParticipant = useRemoveParticipant(event.id);
  const [isAddingGuests, setIsAddingGuests] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<ParticipantView | null>(null);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);

  const isOpen = event.status === 'OPEN';
  const isDrawn = event.status === 'DRAWN';
  const canDraw = event.feasibility === 'OK' && (isOpen || isDrawn);
  const hasGuests = event.participants.some((participant) => participant.isGuest);

  return (
    <>
      <EventStatusBlock event={event} />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-on-surface-variant">
            {TH.manage.participants} ({event.participants.length})
          </h2>
        </div>
        <ParticipantList
          participants={event.participants}
          canRemove={isOpen}
          onRemove={setParticipantToRemove}
        />
        {isOpen && (
          <Button
            variant="tonal"
            icon="person_add"
            className="w-full"
            onClick={() => setIsAddingGuests(true)}
          >
            {TH.manage.addGuests}
          </Button>
        )}
      </section>

      <section className="rounded-2xl bg-surface-container px-4 py-2">
        <Switch
          label={TH.manage.allowViewAll}
          hint={TH.manage.allowViewAllHint}
          checked={event.allowViewAllResults}
          disabled={updateEvent.isPending}
          onChange={(allowViewAllResults) =>
            updateEvent.mutate(
              { allowViewAllResults },
              { onError: (error) => showSnackbar(error.message) },
            )
          }
        />
      </section>

      <div className="flex flex-col gap-2">
        <Link to={`/manage/${event.id}/rules`}>
          <Button variant="orange" icon="rule" className="w-full" tabIndex={-1}>
            {TH.manage.rules}
          </Button>
        </Link>
        {isDrawn && hasGuests && (
          <Link to={`/manage/${event.id}/guests`}>
            <Button variant="outlined" icon="visibility" className="w-full" tabIndex={-1}>
              {TH.manage.guestResults}
            </Button>
          </Link>
        )}
        {isDrawn && (
          <Button
            variant="outlined"
            icon="campaign"
            onClick={() => void shareToChat(TH.manage.announceMessage)}
          >
            {TH.manage.announce}
          </Button>
        )}
        <Button
          variant="filled"
          icon="redeem"
          disabled={!canDraw}
          onClick={() => navigate(`/manage/${event.id}/draw`)}
        >
          {isDrawn ? TH.manage.redraw : TH.manage.draw}
        </Button>
        {!canDraw && isOpen && event.feasibility === 'TOO_FEW_PARTICIPANTS' && (
          <p className="text-center text-xs text-on-surface-variant">{TH.manage.notEnough}</p>
        )}
        <Button variant="danger" className="w-full" onClick={() => setIsConfirmingClose(true)}>
          {TH.manage.close}
        </Button>
      </div>

      {isAddingGuests && (
        <AddGuestsDialog eventId={event.id} onClose={() => setIsAddingGuests(false)} />
      )}
      {participantToRemove && (
        <ConfirmDialog
          title={participantToRemove.displayName}
          message={TH.manage.removeConfirm}
          confirmLabel={TH.common.delete}
          isBusy={removeParticipant.isPending}
          onClose={() => setParticipantToRemove(null)}
          onConfirm={() =>
            removeParticipant.mutate(participantToRemove.id, {
              onSettled: () => setParticipantToRemove(null),
              onError: (error) => showSnackbar(error.message),
            })
          }
        />
      )}
      {isConfirmingClose && (
        <ConfirmDialog
          title={TH.manage.close}
          message={TH.manage.closeConfirm}
          onClose={() => setIsConfirmingClose(false)}
          isBusy={updateEvent.isPending}
          onConfirm={() =>
            updateEvent.mutate(
              { status: 'CLOSED' },
              {
                onSuccess: () => navigate('/manage', { replace: true }),
                onError: (error) => showSnackbar(error.message),
              },
            )
          }
        />
      )}
    </>
  );
}

export function EventDetailPage() {
  const { eventId = '' } = useParams();
  const eventQuery = useEventDetail(eventId);
  return (
    <Page title={eventQuery.data?.name ?? TH.manage.title} backTo="/manage">
      <QueryBoundary query={eventQuery}>
        {(event) => <EventDetailContent event={event} />}
      </QueryBoundary>
    </Page>
  );
}
