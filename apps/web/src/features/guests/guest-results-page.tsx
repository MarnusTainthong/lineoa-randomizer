import type { EventDetail, ResultRow } from '@secret-santa/shared';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Page } from '../../components/ui/page';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { useEventDetail } from '../events/use-events';
import { ResultCard } from '../results/result-card';
import { RoundSwitcher } from '../results/round-switcher';
import { SaveImageButton } from '../results/save-image-button';
import { useGuestResults } from '../results/use-results';
import { TH } from '../../lib/th';

function GuestRow({ row, event, drawVersion }: { row: ResultRow; event: EventDetail; drawVersion: number }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const isReplaced = drawVersion !== event.currentDrawVersion;
  return (
    <li className="space-y-2 rounded-2xl bg-surface-container p-4">
      <p className="font-medium">{row.giverName}</p>
      {isRevealed ? (
        <>
          <p className="text-lg font-bold text-primary">{row.receiverName}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="text" onClick={() => setIsRevealed(false)}>{TH.guests.hide}</Button>
            <SaveImageButton targetRef={exportRef} fileName={`secret-santa-${row.giverName}-round-${drawVersion}.png`} />
          </div>
          <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
            <ResultCard
              ref={exportRef}
              variant="export"
              eventName={event.name}
              caption={`${row.giverName} จับได้`}
              receiverName={row.receiverName}
              budget={event.budget}
              exchangeDate={event.exchangeDate}
              drawVersion={drawVersion}
              isReplaced={isReplaced}
            />
          </div>
        </>
      ) : (
        <Button variant="tonal" icon="visibility" onClick={() => setIsRevealed(true)}>{TH.guests.reveal}</Button>
      )}
    </li>
  );
}

export function GuestResultsPage() {
  const { eventId = '' } = useParams();
  const [version, setVersion] = useState<number>();
  const eventQuery = useEventDetail(eventId);
  const resultsQuery = useGuestResults(eventId, version);

  return (
    <Page title={TH.guests.title} backTo={`/manage/${eventId}`}>
      <QueryBoundary query={eventQuery}>
        {(event) => (
          <QueryBoundary query={resultsQuery}>
            {(results) => (
              <>
                <p className="text-sm text-on-surface-variant">{TH.guests.tellThem}</p>
                <RoundSwitcher versions={results.availableVersions} selectedVersion={results.drawVersion} onSelect={setVersion} />
                {results.rows.length === 0 ? (
                  <EmptyState message={TH.guests.empty} />
                ) : (
                  <ul className="space-y-2">
                    {results.rows.map((row) => (
                      <GuestRow key={`${results.drawVersion}-${row.giverName}`} row={row} event={event} drawVersion={results.drawVersion} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </QueryBoundary>
        )}
      </QueryBoundary>
    </Page>
  );
}
