import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TH } from '../../lib/th';
import { IconButton } from './button';

/** Top app bar + content column. Pass `backTo` for a back arrow. */
export function Page({
  title,
  backTo,
  action,
  children,
}: {
  title: string;
  backTo?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <>
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-1 bg-surface px-2">
        {backTo && <IconButton icon="arrow_back" label={TH.common.back} onClick={() => navigate(backTo)} />}
        <h1 className="flex-1 truncate px-2 text-xl font-medium">{title}</h1>
        {action}
      </header>
      <div className="space-y-4 px-4 pb-8">{children}</div>
    </>
  );
}
