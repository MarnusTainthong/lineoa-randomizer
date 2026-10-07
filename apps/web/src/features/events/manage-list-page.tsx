import { Link } from 'react-router-dom';
import { Chip } from '../../components/ui/chip';
import { Page } from '../../components/ui/page';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { FeasibilityBadge } from './feasibility-badge';
import { useEventList } from './use-events';

export function ManageListPage() {
  const eventsQuery = useEventList('organized');
  return (
    <Page title={TH.manage.title}>
      <QueryBoundary query={eventsQuery}>
        {(events) =>
          events.length === 0 ? (
            <EmptyState message={TH.manage.empty} />
          ) : (
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    to={`/manage/${event.id}`}
                    className="state-layer flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-surface-container px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{event.name}</span>
                      <span className="block text-xs text-on-surface-variant">{event.participantCount} คน</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {event.status === 'OPEN' && <FeasibilityBadge feasibility={event.feasibility} />}
                      <Chip tone={event.status === 'DRAWN' ? 'primary' : 'neutral'}>{TH.status[event.status]}</Chip>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryBoundary>

      <Link
        to="/manage/new"
        aria-label={TH.manage.create}
        className="state-layer fixed bottom-24 right-4 z-20 flex h-14 items-center gap-2 rounded-2xl bg-secondary-container px-5 font-medium text-on-secondary-container shadow-lg md:right-[calc(50%-224px)]"
      >
        <span className="material-symbols-outlined" aria-hidden>add</span>
        {TH.manage.create}
      </Link>
    </Page>
  );
}
