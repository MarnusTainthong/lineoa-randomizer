import type { EventDetail } from '@line-oa-randomizer/shared';
import { Chip } from '../../components/ui/chip';
import { TH } from '../../lib/th';

export function FeasibilityBadge({ feasibility }: { feasibility: EventDetail['feasibility'] }) {
  if (!feasibility) return null;
  return (
    <Chip tone={feasibility === 'OK' ? 'primary' : 'error'}>{TH.feasibility[feasibility]}</Chip>
  );
}

/** Warning shown whenever the rules or headcount block a draw. Organizer only. */
export function FeasibilityBanner({
  event,
}: {
  event: Pick<EventDetail, 'feasibility' | 'feasibilityReason'>;
}) {
  if (!event.feasibility || event.feasibility === 'OK') return null;
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-surface"
    >
      <span className="material-symbols-outlined mt-0.5 !text-[20px] text-error" aria-hidden>
        error
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-error">{TH.feasibility[event.feasibility]}</p>
        {event.feasibilityReason && <p className="mt-1 leading-5">{event.feasibilityReason}</p>}
      </div>
    </div>
  );
}

/** Status chips, then the error banner, directly under a page header. */
export function EventStatusBlock({
  event,
}: {
  event: Pick<EventDetail, 'status' | 'feasibility' | 'feasibilityReason' | 'currentDrawVersion'>;
}) {
  const isDrawn = event.status === 'DRAWN';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={isDrawn ? 'primary' : 'neutral'}>{TH.status[event.status]}</Chip>
        {event.status === 'OPEN' && event.feasibility === 'OK' && (
          <FeasibilityBadge feasibility={event.feasibility} />
        )}
        {event.currentDrawVersion > 0 && (
          <Chip>
            {TH.common.round} {event.currentDrawVersion}
          </Chip>
        )}
      </div>
      <FeasibilityBanner event={event} />
    </div>
  );
}
