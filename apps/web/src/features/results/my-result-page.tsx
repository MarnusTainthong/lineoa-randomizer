import type { MyResult } from '@secret-santa/shared';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Page } from '../../components/ui/page';
import { EmptyState, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { formatThaiDate } from '../../lib/utils';
import { HistoryList } from './history-list';
import { fireRevealConfetti } from './reveal-confetti';
import { ResultCard } from './result-card';
import { SaveImageButton } from './save-image-button';
import { useAcknowledgeDraw, useMyHistory, useMyResult } from './use-results';

function MyResultContent({ result }: { result: MyResult }) {
  const [hasJustOpened, setHasJustOpened] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const acknowledgeDraw = useAcknowledgeDraw(result.eventId);
  const isDrawn = result.receiverName !== null;
  const isOpened = hasJustOpened || result.hasOpenedCurrent;
  const historyQuery = useMyHistory(result.eventId, isDrawn && isOpened);

  function openEnvelope() {
    setHasJustOpened(true);
    fireRevealConfetti();
    acknowledgeDraw.mutate();
  }

  if (!isDrawn) return <EmptyState message={TH.results.notDrawnYet} />;

  return (
    <>
      {result.hasNewDraw && !isOpened && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-secondary-container p-4 text-on-secondary-container">
          <p className="text-sm font-medium">{TH.results.redrawBanner(result.drawVersion)}</p>
          <Button variant="text" onClick={() => acknowledgeDraw.mutate()}>{TH.results.acknowledge}</Button>
        </div>
      )}

      <p className="text-sm text-on-surface-variant">
        {TH.results.current} · {TH.common.round} {result.drawVersion}
        {result.drawnAt && ` · ${formatThaiDate(result.drawnAt, true)}`}
      </p>

      {isOpened ? (
        <>
          <ResultCard
            eventName={result.eventName}
            receiverName={result.receiverName ?? ''}
            budget={result.budget}
            exchangeDate={result.exchangeDate}
            drawVersion={result.drawVersion}
          />
          <div className="flex flex-wrap gap-2">
            <SaveImageButton targetRef={exportRef} fileName={`secret-santa-round-${result.drawVersion}.png`} />
            {result.allowViewAllResults && (
              <Link to={`/results/${result.eventId}/all`}>
                <Button variant="outlined" icon="groups" tabIndex={-1}>{TH.results.viewAll}</Button>
              </Link>
            )}
          </div>
          <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
            <ResultCard
              ref={exportRef}
              variant="export"
              eventName={result.eventName}
              receiverName={result.receiverName ?? ''}
              budget={result.budget}
              exchangeDate={result.exchangeDate}
              drawVersion={result.drawVersion}
            />
          </div>
          {historyQuery.data && <HistoryList entries={historyQuery.data} result={result} />}
        </>
      ) : (
        <button
          type="button"
          onClick={openEnvelope}
          className="state-layer flex min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-tertiary bg-primary-container text-on-primary-container"
        >
          <span className="material-symbols-outlined !text-[56px]" aria-hidden>mail</span>
          <span className="text-lg font-medium">{TH.results.openEnvelope}</span>
          <span className="text-sm opacity-80">{result.eventName}</span>
        </button>
      )}
    </>
  );
}

export function MyResultPage() {
  const { eventId = '' } = useParams();
  const resultQuery = useMyResult(eventId);
  return (
    <Page title={resultQuery.data?.eventName ?? TH.results.title} backTo="/results">
      <QueryBoundary query={resultQuery}>{(result) => <MyResultContent result={result} />}</QueryBoundary>
    </Page>
  );
}
