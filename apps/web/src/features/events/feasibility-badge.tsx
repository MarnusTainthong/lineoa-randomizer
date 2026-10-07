import type { EventDetail } from '@line-oa-randomizer/shared';
import { Chip } from '../../components/ui/chip';
import { TH } from '../../lib/th';

export function FeasibilityBadge({ feasibility }: { feasibility: EventDetail['feasibility'] }) {
  if (!feasibility) return null;
  return (
    <Chip tone={feasibility === 'OK' ? 'primary' : 'error'}>
      <span className="material-symbols-outlined mr-1 !text-base" aria-hidden>
        {feasibility === 'OK' ? 'check' : 'close'}
      </span>
      {TH.feasibility[feasibility]}
    </Chip>
  );
}

/** Warning shown whenever the rules or headcount block a draw. Organizer only. */
export function FeasibilityBanner({ event }: { event: Pick<EventDetail, 'feasibility' | 'feasibilityReason'> }) {
  if (!event.feasibility || event.feasibility === 'OK') return null;
  return (
    <div role="alert" className="rounded-2xl bg-error-container p-4 text-sm text-error">
      <p className="font-medium">{TH.feasibility[event.feasibility]}</p>
      {event.feasibilityReason && <p className="mt-1">{event.feasibilityReason}</p>}
    </div>
  );
}
