import { NavLink, Outlet } from 'react-router-dom';
import { DevToolbar } from '../features/dev/dev-toolbar';
import { isDevAuthEnabled } from '../lib/liff';
import { TH } from '../lib/th';
import { cn } from '../lib/utils';

const TABS = [
  { to: '/results', label: TH.nav.results, icon: 'redeem' },
  { to: '/manage', label: TH.nav.manage, icon: 'tune' },
] as const;

/** Mobile column (max 480px) with a Material bottom navigation matching the Rich Menu. */
export function AppShell() {
  return (
    <div className={cn('mx-auto min-h-screen max-w-[480px] pb-24', isDevAuthEnabled && 'pt-16')}>
      <DevToolbar />
      <Outlet />
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-20 max-w-[480px] bg-surface-container">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="flex flex-1 flex-col items-center justify-center gap-1 text-xs">
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-200 ease-standard',
                    isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant',
                  )}
                >
                  <span className="material-symbols-outlined" aria-hidden>{tab.icon}</span>
                </span>
                <span className={isActive ? 'font-medium text-on-surface' : 'text-on-surface-variant'}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
