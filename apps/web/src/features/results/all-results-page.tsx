import { useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Page } from '../../components/ui/page';
import { QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { AllResultsBoard } from './all-results-board';
import { SaveImageButton } from './save-image-button';
import { useAllResults, useMyResult } from './use-results';

function requestedVersion(raw: string | null): number | undefined {
  const version = Number(raw);
  return Number.isInteger(version) && version > 0 ? version : undefined;
}

export function AllResultsPage() {
  const { eventId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const version = requestedVersion(searchParams.get('version'));
  const exportRef = useRef<HTMLDivElement>(null);
  const resultsQuery = useAllResults(eventId, version);
  const myResultQuery = useMyResult(eventId);
  const eventName = myResultQuery.data?.eventName ?? '';

  return (
    <Page title={TH.results.allResultsTitle} backTo={`/results/${eventId}`}>
      <QueryBoundary query={resultsQuery}>
        {(results) => (
          <>
            <AllResultsBoard
              ref={exportRef}
              eventName={eventName}
              drawVersion={results.drawVersion}
              drawnAt={results.drawnAt}
              rows={results.rows}
            />
            <SaveImageButton
              targetRef={exportRef}
              fileName={`line-oa-randomizer-all-round-${results.drawVersion}.png`}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
