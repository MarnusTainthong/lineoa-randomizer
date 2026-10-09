import { formatInviteCode } from '@line-oa-randomizer/shared';
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
    <Page title={TH.manage.title} tone="brand" icon="tune">
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
                    className="state-layer flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{event.name}</span>
                      <span className="block text-xs text-on-surface-variant">
                        {TH.join.codeLabel} {formatInviteCode(event.inviteCode)}
                        {' · '}
                        {event.participantCount} คน
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <Chip tone={event.status === 'DRAWN' ? 'primary' : 'neutral'}>
                        {TH.status[event.status]}
                      </Chip>
                      {event.status === 'OPEN' && (
                        <FeasibilityBadge feasibility={event.feasibility} />
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryBoundary>
      <div className="h-20" aria-hidden />

      <Link
        to="/manage/new"
        aria-label={TH.manage.create}
        className="state-layer soft-shadow fixed bottom-5 left-1/2 z-20 flex h-14 w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-on-primary shadow-lg"
      >
        <span className="material-symbols-outlined" aria-hidden>
          add
        </span>
        {TH.manage.create}
      </Link>
    </Page>
  );
}
