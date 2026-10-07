import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../components/ui/page';
import { QueryBoundary } from '../../components/ui/states';
import { TH } from '../../lib/th';
import { RoundSwitcher } from './round-switcher';
import { SaveImageButton } from './save-image-button';
import { useAllResults } from './use-results';

export function AllResultsPage() {
  const { eventId = '' } = useParams();
  const [version, setVersion] = useState<number>();
  const tableRef = useRef<HTMLDivElement>(null);
  const resultsQuery = useAllResults(eventId, version);

  return (
    <Page title={TH.results.allResultsTitle} backTo={`/results/${eventId}`}>
      <QueryBoundary query={resultsQuery}>
        {(results) => (
          <>
            <RoundSwitcher
              versions={results.availableVersions}
              selectedVersion={results.drawVersion}
              onSelect={setVersion}
            />
            <div ref={tableRef} className="rounded-2xl bg-surface p-2">
              <p className="px-2 pb-2 text-xs text-on-surface-variant">
                {TH.common.round} {results.drawVersion}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant">
                    <th className="px-3 py-2 font-medium">{TH.results.giver}</th>
                    <th className="px-3 py-2 font-medium">{TH.results.receiver}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row) => (
                    <tr key={row.giverName} className="border-t border-outline-variant">
                      <td className="px-3 py-3">{row.giverName}</td>
                      <td className="px-3 py-3 font-medium">{row.receiverName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SaveImageButton targetRef={tableRef} fileName={`line-oa-randomizer-all-round-${results.drawVersion}.png`} />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
