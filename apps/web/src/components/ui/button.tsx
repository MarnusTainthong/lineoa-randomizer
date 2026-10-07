import type { ButtonHTMLAttributes } from 'react';
import { TH } from '../../lib/th';
import { cn } from '../../lib/utils';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'accent' | 'orange' | 'danger';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary shadow-sm',
  accent: 'bg-secondary text-on-secondary shadow-sm',
  tonal: 'bg-primary-container text-on-primary-container',
  orange: 'bg-[var(--orange)] text-[var(--on-orange)] shadow-sm',
  danger: 'bg-error text-on-error shadow-sm',
  outlined: 'border border-outline-variant bg-surface text-primary',
  text: 'text-primary',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  loading?: boolean;
}

export function Button({
  variant = 'filled',
  icon,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'state-layer inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold transition-all duration-200 ease-standard hover:-translate-y-0.5',
        'disabled:pointer-events-none disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          {TH.common.loading}
        </>
      ) : (
        <>
          {icon && (
            <span className="material-symbols-outlined" aria-hidden>
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string; loading?: boolean }) {
  return (
    <button
      type="button"
      aria-label={loading ? TH.common.loading : label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'state-layer inline-flex size-12 items-center justify-center rounded-2xl text-on-surface-variant',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        <span className="material-symbols-outlined" aria-hidden>
          {icon}
        </span>
      )}
    </button>
  );
}
