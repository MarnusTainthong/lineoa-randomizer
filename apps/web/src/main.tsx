import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './app/auth-provider';
import { createAppRouter } from './app/router';
import { SnackbarProvider } from './components/ui/snackbar';
import { LoadingIndicator } from './components/ui/states';
import { prepareLiffEntry } from './lib/liff';
import './styles/index.css';

// Follow the system theme (LINE in-app browser reports it).
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => document.documentElement.classList.toggle('dark', darkModeQuery.matches);
applyTheme();
darkModeQuery.addEventListener('change', applyTheme);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 5_000 } },
});

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <div className="app-background mx-auto flex min-h-screen max-w-[480px] items-center justify-center">
    <LoadingIndicator />
  </div>,
);

// LIFF rewrites the rich-menu path during init. The router must be created after that.
void prepareLiffEntry()
  .catch(() => undefined)
  .then(() => {
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <AuthProvider>
              <RouterProvider router={createAppRouter()} />
            </AuthProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </StrictMode>,
    );
  });
