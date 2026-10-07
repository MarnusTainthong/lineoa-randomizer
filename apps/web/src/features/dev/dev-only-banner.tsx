import { TH } from '../../lib/th';

/** Slim banner under the header on screens that exist only while dev auth is on. */
export function DevOnlyBanner() {
  return (
    <p
      role="note"
      className="bg-on-surface px-4 py-2 text-center text-xs font-semibold tracking-wide text-surface"
    >
      {TH.dev.onlyInDev}
    </p>
  );
}
