import type { ParticipantView } from '@secret-santa/shared';
import { Chip } from '../../components/ui/chip';
import { IconButton } from '../../components/ui/button';
import { TH } from '../../lib/th';

export function ParticipantList({
  participants,
  canRemove,
  onRemove,
}: {
  participants: ParticipantView[];
  canRemove: boolean;
  onRemove: (participant: ParticipantView) => void;
}) {
  return (
    <ul className="divide-y divide-outline-variant rounded-2xl bg-surface-container">
      {participants.map((participant) => (
        <li key={participant.id} className="flex min-h-14 items-center gap-3 px-4">
          {participant.pictureUrl ? (
            <img src={participant.pictureUrl} alt="" className="size-8 rounded-full" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-full bg-surface-container-high text-sm text-on-surface-variant">
              {participant.displayName.slice(0, 1)}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{participant.displayName}</span>
          {participant.isOrganizer && <Chip tone="primary">{TH.manage.organizer}</Chip>}
          {participant.isGuest && <Chip>{TH.manage.guest}</Chip>}
          {canRemove && !participant.isOrganizer && (
            <IconButton icon="close" label={TH.common.delete} onClick={() => onRemove(participant)} />
          )}
        </li>
      ))}
    </ul>
  );
}
