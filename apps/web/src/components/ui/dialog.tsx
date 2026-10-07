import type { ReactNode } from 'react';
import { TH } from '../../lib/th';
import { Button } from './button';

/** Centered modal. Overlay click closes. Only dialogs get a shadow (M3 elevation rule). */
export function Dialog({
  title,
  children,
  actions,
  onClose,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full max-w-sm overflow-auto rounded-3xl bg-surface-container p-6 shadow-xl"
      >
        <h2 className="mb-3 text-xl font-medium">{title}</h2>
        <div className="text-sm text-on-surface-variant">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          {actions ?? <Button variant="text" onClick={onClose}>{TH.common.close}</Button>}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = TH.common.confirm,
  isBusy,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button variant="text" onClick={onClose}>{TH.common.cancel}</Button>
          <Button variant="accent" onClick={onConfirm} disabled={isBusy}>{confirmLabel}</Button>
        </>
      }
    >
      {message}
    </Dialog>
  );
}
