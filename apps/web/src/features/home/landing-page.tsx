import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../app/auth-provider';
import { isDevAuthEnabled, isInLineApp, liffEntryUrl, type LiffApp } from '../../lib/liff';
import { TH } from '../../lib/th';
import { leaveDevIdentity } from '../dev/dev-api';
import { DevOnlyBanner } from '../dev/dev-only-banner';

const MENUS: {
  app: LiffApp;
  to: '/results' | '/manage';
  title: string;
  hint: string;
  icon: string;
  tile: string;
}[] = [
  {
    app: 'results',
    to: '/results',
    title: TH.nav.results,
    hint: TH.landing.resultsHint,
    icon: 'redeem',
    tile: 'bg-primary text-on-primary',
  },
  {
    app: 'manage',
    to: '/manage',
    title: TH.nav.manage,
    hint: TH.landing.manageHint,
    icon: 'tune',
    tile: 'bg-secondary text-on-secondary',
  },
];

function menuDestination(app: LiffApp, path: '/results' | '/manage'): string {
  if (isDevAuthEnabled || isInLineApp()) return path;
  return liffEntryUrl(app) ?? path;
}

/** Main menu. In dev, the header shows who this tab is logged in as. */
export function LandingPage() {
  const user = useCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-20">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-outline-variant bg-surface-container/90 px-5 backdrop-blur-md">
          {isDevAuthEnabled ? (
            <>
              <p className="min-w-0 truncate text-sm">
                <span className="text-on-surface-variant">{TH.dev.loginAs} </span>
                <span className="font-semibold">{user.displayName}</span>
              </p>
              <button
                type="button"
                onClick={leaveDevIdentity}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                {TH.dev.switchUser}
              </button>
            </>
          ) : (
            <p className="truncate text-sm font-semibold">{TH.appName}</p>
          )}
        </header>
        {isDevAuthEnabled && <DevOnlyBanner />}
      </div>

      <main className="flex flex-1 flex-col px-5 pb-10 pt-8">
        <p className="text-sm font-medium text-on-surface-variant">{TH.appName}</p>
        <h1 className="mt-2 text-[1.75rem] font-bold tracking-tight">{TH.landing.title}</h1>
        <p className="mt-1 max-w-[18rem] text-sm text-on-surface-variant">{TH.landing.subtitle}</p>

        <ul className="mt-7 space-y-3">
          {MENUS.map((menu) => {
            const destination = menuDestination(menu.app, menu.to);
            const className =
              'state-layer flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container px-4 py-4 text-left';
            const body = (
              <>
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${menu.tile}`}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    {menu.icon}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{menu.title}</span>
                  <span className="mt-0.5 block text-sm text-on-surface-variant">{menu.hint}</span>
                </span>
                <span className="material-symbols-outlined text-on-surface-variant" aria-hidden>
                  chevron_right
                </span>
              </>
            );
            return (
              <li key={menu.to}>
                {destination.startsWith('/') ? (
                  <Link to={destination} className={className}>
                    {body}
                  </Link>
                ) : (
                  <a href={destination} className={className}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
