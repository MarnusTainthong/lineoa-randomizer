import { Link } from 'react-router-dom';
import { Chip } from '../../components/ui/chip';
import { Page } from '../../components/ui/page';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { useEventList } from '../events/use-events';

export function ResultsListPage() {
  const eventsQuery = useEventList('joined');
  return (
    <Page title={TH.results.title}>
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
                    className="state-layer flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-surface-container px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{event.name}</span>
                      <span className="block text-xs text-on-surface-variant">
                        {event.participantCount} คน
                        {event.currentDrawVersion > 0 && ` · ${TH.common.round} ${event.currentDrawVersion}`}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {event.hasNewDraw && <Chip tone="accent">{TH.results.redrawnBadge}</Chip>}
                      <Chip tone={event.status === 'DRAWN' ? 'primary' : 'neutral'}>{TH.status[event.status]}</Chip>
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
