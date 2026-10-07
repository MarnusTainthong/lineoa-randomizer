import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'accent';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary',
  accent: 'bg-secondary text-on-secondary', // draw button, important actions
  tonal: 'bg-primary-container text-on-primary-container',
  outlined: 'border border-outline text-primary',
  text: 'text-primary',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
}

export function Button({ variant = 'filled', icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'state-layer inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-200 ease-standard',
        'disabled:pointer-events-none disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:opacity-60',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined" aria-hidden>{icon}</span>}
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn('state-layer inline-flex size-12 items-center justify-center rounded-full text-on-surface-variant', className)}
      {...props}
    >
      <span className="material-symbols-outlined" aria-hidden>{icon}</span>
    </button>
  );
}
