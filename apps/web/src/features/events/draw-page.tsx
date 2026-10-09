import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/dialog';
import { Page } from '../../components/ui/page';
import { useSnackbar } from '../../components/ui/snackbar';
import { PanelSkeleton, QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { FeasibilityBanner } from './feasibility-badge';
import { useDraw, useEventDetail } from './use-events';

const DRAW_ANIMATION_MS = 1200;

export function DrawPage() {
  const { eventId = '' } = useParams();
  const showSnackbar = useSnackbar();
  const eventQuery = useEventDetail(eventId);
  const isRedraw = (eventQuery.data?.currentDrawVersion ?? 0) > 0;
  const draw = useDraw(eventId, isRedraw);
  const [isConfirming, setIsConfirming] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'done'>('idle');
  const [doneVersion, setDoneVersion] = useState(0);

  function runDraw() {
    setIsConfirming(false);
    setPhase('drawing');
    const animationDelay = new Promise((resolve) => window.setTimeout(resolve, DRAW_ANIMATION_MS));
    draw.mutate(undefined, {
      onSuccess: async (response) => {
        await animationDelay; // short, purposeful pause so the draw feels real
        setDoneVersion(response.drawVersion);
        setPhase('done');
      },
      onError: (error) => {
        setPhase('idle');
        showSnackbar(error.message);
      },
    });
  }

  return (
    <Page title={TH.draw.title} backTo={`/manage/${eventId}`}>
      <QueryBoundary query={eventQuery} pending={<PanelSkeleton />}>
        {(event) => (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 text-center">
            <FeasibilityBanner event={event} />
            {phase === 'drawing' && (
              <p className="animate-pulse text-xl font-medium text-primary">{TH.draw.drawing}</p>
            )}
            {phase === 'done' && (
              <>
                <p className="text-xl font-medium text-primary">
                  {TH.draw.done} ({TH.common.round} {doneVersion})
                </p>
                <div className="flex flex-col gap-2">
                  <Link to={`/results/${eventId}`}>
                    <Button variant="outlined" className="w-full" tabIndex={-1}>
                      {TH.nav.results}
                    </Button>
                  </Link>
                </div>
              </>
            )}
            {phase === 'idle' && (
              <>
                <h2 className="text-2xl font-medium">{event.name}</h2>
                <p className="text-on-surface-variant">{event.participants.length} คน</p>
                <Button
                  variant="filled"
                  icon="redeem"
                  disabled={event.feasibility !== 'OK'}
                  onClick={() => setIsConfirming(true)}
                >
                  {isRedraw ? TH.manage.redraw : TH.manage.draw}
                </Button>
              </>
            )}
          </div>
        )}
      </QueryBoundary>
      {isConfirming && (
        <ConfirmDialog
          title={isRedraw ? TH.manage.redraw : TH.manage.draw}
          message={isRedraw ? TH.draw.confirmRedraw : TH.draw.confirmDraw}
          onClose={() => setIsConfirming(false)}
          onConfirm={runDraw}
        />
      )}
    </Page>
  );
}
