import { Link } from 'react-router-dom';
import { Chip } from '../../components/ui/chip';
import { Page } from '../../components/ui/page';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { useEventList } from '../events/use-events';

export function ResultsListPage() {
  const eventsQuery = useEventList('joined');
  return (
    <Page title={TH.results.title} tone="brand" icon="redeem">
      <QueryBoundary query={eventsQuery}>
        {(events) =>
          events.length === 0 ? (
            <EmptyState message={TH.results.empty} />
          ) : (
            <ul className="space-y-2">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    to={`/results/${event.id}`}
                    className="state-layer flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{event.name}</span>
                      <span className="block text-xs text-on-surface-variant">
                        {event.participantCount} คน
                        {event.currentDrawVersion > 0 &&
                          ` · ${TH.common.round} ${event.currentDrawVersion}`}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip tone={event.status === 'DRAWN' ? 'primary' : 'neutral'}>
                        {TH.status[event.status]}
                      </Chip>
                      {event.hasNewDraw && <Chip tone="accent">{TH.results.redrawnBadge}</Chip>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryBoundary>
    </Page>
  );
}
