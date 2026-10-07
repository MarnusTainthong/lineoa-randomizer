import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const SnackbarContext = createContext<(message: string) => void>(() => undefined);

export const useSnackbar = () => useContext(SnackbarContext);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage((current) => (current === nextMessage ? null : current)), 3500);
  }, []);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      {message && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-[448px] rounded-xl bg-on-surface px-4 py-3 text-sm text-surface shadow-lg"
        >
          {message}
        </div>
      )}
    </SnackbarContext.Provider>
  );
}
