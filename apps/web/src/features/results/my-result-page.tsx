import type { MyResult, ResultHistoryEntry } from '@line-oa-randomizer/shared';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Page } from '../../components/ui/page';
import { CardSkeleton, EmptyState, ListSkeleton, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { formatThaiDate } from '../../lib/utils';
import { HistoryList } from './history-list';
import { fireRevealConfetti } from './reveal-confetti';
import { ResultCard } from './result-card';
import { RoundRulesDialog } from './round-rules-dialog';
import { SaveImageButton } from './save-image-button';
import { useAcknowledgeDraw, useMyHistory, useMyResult } from './use-results';

function MyResultContent({ result }: { result: MyResult }) {
  const [hasJustOpened, setHasJustOpened] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ResultHistoryEntry | null>(null);
  const [isViewingRules, setIsViewingRules] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const acknowledgeDraw = useAcknowledgeDraw(result.eventId);
  const isDrawn = result.receiverName !== null;
  const isOpened = hasJustOpened || result.hasOpenedCurrent;
  const historyQuery = useMyHistory(result.eventId, isDrawn && isOpened);
  const shownVersion = selectedEntry?.drawVersion ?? result.drawVersion;
  const shownReceiver = selectedEntry?.receiverName ?? result.receiverName ?? '';
  const shownAt = selectedEntry?.drawnAt ?? result.drawnAt;
  const isCurrentRound = selectedEntry?.isCurrent ?? true;

  function openEnvelope() {
    setHasJustOpened(true);
    fireRevealConfetti();
    acknowledgeDraw.mutate();
  }

  if (!isDrawn) return <EmptyState message={TH.results.notDrawnYet} />;

  return (
    <>
      {result.hasNewDraw && !isOpened && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl bg-secondary-container p-4 text-on-secondary-container"
        >
          <p className="text-sm font-medium">{TH.results.redrawBanner(result.drawVersion)}</p>
          <Button
            variant="text"
            loading={acknowledgeDraw.isPending}
            onClick={() => acknowledgeDraw.mutate()}
          >
            {TH.results.acknowledge}
          </Button>
        </div>
      )}

      <p className="text-sm text-on-surface-variant">
        {isCurrentRound && `${TH.results.current} · `}
        {TH.common.round} {shownVersion}
        {shownAt && ` · ${formatThaiDate(shownAt, true)}`}
      </p>

      {isOpened ? (
        <>
          <ResultCard
            eventName={result.eventName}
            receiverName={shownReceiver}
            drawVersion={shownVersion}
          />
          <div className="flex flex-wrap gap-2">
            <SaveImageButton
              targetRef={exportRef}
              fileName={`line-oa-randomizer-round-${shownVersion}.png`}
            />
            <Button variant="outlined" icon="rule" onClick={() => setIsViewingRules(true)}>
              {TH.results.viewRules}
            </Button>
            {result.allowViewAllResults && (
              <Link to={`/results/${result.eventId}/all?version=${shownVersion}`}>
                <Button variant="outlined" icon="groups" tabIndex={-1}>
                  {TH.results.viewAll}
                </Button>
              </Link>
            )}
          </div>
          <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
            <ResultCard
              ref={exportRef}
              variant="export"
              eventName={result.eventName}
              receiverName={shownReceiver}
              drawVersion={shownVersion}
            />
          </div>
          {isViewingRules && (
            <RoundRulesDialog
              eventId={result.eventId}
              version={shownVersion}
              onClose={() => setIsViewingRules(false)}
            />
          )}
          {historyQuery.isLoading && <ListSkeleton rows={2} />}
          {historyQuery.data && (
            <HistoryList
              entries={historyQuery.data}
              selectedVersion={shownVersion}
              onSelect={setSelectedEntry}
            />
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={openEnvelope}
          className="state-layer flex min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-tertiary bg-primary-container text-on-primary-container"
        >
          <span className="material-symbols-outlined !text-[56px]" aria-hidden>
            mail
          </span>
          <span className="text-lg font-medium">{TH.results.openEnvelope}</span>
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
      <QueryBoundary query={resultQuery} pending={<CardSkeleton />}>
        {(result) => <MyResultContent result={result} />}
      </QueryBoundary>
    </Page>
  );
}
