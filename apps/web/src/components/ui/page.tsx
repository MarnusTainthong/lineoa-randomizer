import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TH } from '../../lib/th';
import { cn } from '../../lib/utils';
import { IconButton } from './button';

/** Top app bar + content column. Pass `backTo` for a back arrow. `brand` tints the bar green. */
export function Page({
  title,
  backTo,
  action,
  icon,
  tone = 'plain',
  children,
}: {
  title: string;
  backTo?: string;
  action?: ReactNode;
  icon?: string;
  tone?: 'plain' | 'brand';
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const isBrand = tone === 'brand';
  return (
    <>
      <header
        className={cn(
          'sticky top-[var(--dev-bar,0px)] z-10 flex min-h-16 items-center gap-2 px-4',
          isBrand
            ? 'bg-primary text-on-primary'
            : 'border-b border-outline-variant bg-surface-container/90 backdrop-blur-md',
        )}
      >
        {backTo && (
          <IconButton icon="arrow_back" label={TH.common.back} onClick={() => navigate(backTo)} />
        )}
        {icon && (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl',
              isBrand ? 'bg-on-primary/15' : 'bg-primary-container text-on-primary-container',
            )}
            aria-hidden
          >
            <span className="material-symbols-outlined !text-[20px]">{icon}</span>
          </span>
        )}
        <h1 className="flex-1 truncate text-lg font-semibold tracking-tight">{title}</h1>
        {action}
      </header>
      <div className="space-y-5 px-4 pb-10 pt-5">{children}</div>
    </>
  );
}
