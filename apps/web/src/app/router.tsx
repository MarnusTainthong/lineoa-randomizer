import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AllResultsPage } from '../features/results/all-results-page';
import { CreateEventPage } from '../features/events/create-event-page';
import { DrawPage } from '../features/events/draw-page';
import { EventDetailPage } from '../features/events/event-detail-page';
import { GuestResultsPage } from '../features/guests/guest-results-page';
import { JoinPage } from '../features/events/join-page';
import { ManageListPage } from '../features/events/manage-list-page';
import { MyResultPage } from '../features/results/my-result-page';
import { ResultsListPage } from '../features/results/results-list-page';
import { RulesPage } from '../features/rules/rules-page';
import { AppShell } from './app-shell';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/results" replace /> },
      { path: '/results', element: <ResultsListPage /> },
      { path: '/results/:eventId', element: <MyResultPage /> },
      { path: '/results/:eventId/all', element: <AllResultsPage /> },
      { path: '/manage', element: <ManageListPage /> },
      { path: '/manage/new', element: <CreateEventPage /> },
      { path: '/manage/:eventId', element: <EventDetailPage /> },
      { path: '/manage/:eventId/rules', element: <RulesPage /> },
      { path: '/manage/:eventId/draw', element: <DrawPage /> },
      { path: '/manage/:eventId/guests', element: <GuestResultsPage /> },
      { path: '/join/:inviteCode', element: <JoinPage /> },
    ],
  },
]);
