import type { CSSProperties } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DevToolbar } from '../features/dev/dev-toolbar';
import { isDevAuthEnabled } from '../lib/liff';

/** Mobile column (max 480px). Each LIFF is one menu; the landing page switches between them. */
export function AppShell() {
  const { pathname } = useLocation();
  const showDevBar = isDevAuthEnabled && pathname !== '/';
  const devBarIsTall = showDevBar && /\/manage\/(?!new$)[^/]+/.test(pathname);
  return (
    <div
      className="app-background mx-auto min-h-screen max-w-[480px]"
      style={
        { '--dev-bar': devBarIsTall ? '5.5rem' : showDevBar ? '2.75rem' : '0px' } as CSSProperties
      }
    >
      {showDevBar && <DevToolbar />}
      <Outlet />
    </div>
  );
}
