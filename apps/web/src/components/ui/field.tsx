import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface FieldShellProps {
  label: string;
  error?: string;
}

const CONTROL_CLASSES =
  'w-full rounded-xl border border-outline bg-surface px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldShellProps>(
  function TextField({ label, error, className, ...props }, ref) {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-on-surface-variant">{label}</span>
        <input ref={ref} className={cn(CONTROL_CLASSES, 'min-h-12', className)} {...props} />
        {error && <span className="mt-1 block text-xs text-error">{error}</span>}
      </label>
    );
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShellProps>(
  function TextAreaField({ label, error, className, ...props }, ref) {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-on-surface-variant">{label}</span>
        <textarea ref={ref} className={cn(CONTROL_CLASSES, 'min-h-24', className)} {...props} />
        {error && <span className="mt-1 block text-xs text-error">{error}</span>}
      </label>
    );
  },
);
