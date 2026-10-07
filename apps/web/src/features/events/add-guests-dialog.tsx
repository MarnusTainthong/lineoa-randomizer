import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { TextAreaField } from '../../components/ui/field';
import { useSnackbar } from '../../components/ui/snackbar';
import { TH } from '../../lib/th';
import { parseGuestNames } from '../../lib/utils';
import { useAddGuests } from './use-events';

export function AddGuestsDialog({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const [rawNames, setRawNames] = useState('');
  const showSnackbar = useSnackbar();
  const addGuests = useAddGuests(eventId);
  const names = parseGuestNames(rawNames);

  return (
    <Dialog
      title={TH.manage.addGuests}
      onClose={onClose}
      actions={
        <>
          <Button variant="text" onClick={onClose}>
            {TH.common.cancel}
          </Button>
          <Button
            disabled={names.length === 0}
            loading={addGuests.isPending}
            onClick={() =>
              addGuests.mutate(names, {
                onSuccess: onClose,
                onError: (error) => showSnackbar(error.message),
              })
            }
          >
            {TH.common.save} ({names.length})
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p>{TH.manage.addGuestsNotice}</p>
        <TextAreaField
          label={TH.manage.addGuestsHint}
          value={rawNames}
          onChange={(event) => setRawNames(event.target.value)}
        />
      </div>
    </Dialog>
  );
}
