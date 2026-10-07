import type { MyResult, ResultHistoryEntry, RoundResults } from '@line-oa-randomizer/shared';
import { apiFetch } from '../../lib/api-client';

const versionQuery = (version?: number) => (version ? `?version=${version}` : '');

export const resultsApi = {
  myResult: (eventId: string) => apiFetch<MyResult>(`/events/${eventId}/my-result`),
  myHistory: (eventId: string) => apiFetch<ResultHistoryEntry[]>(`/events/${eventId}/my-result/history`),
  acknowledge: (eventId: string) =>
    apiFetch<void>(`/events/${eventId}/my-result/ack`, { method: 'POST' }),
  guestResults: (eventId: string, version?: number) =>
    apiFetch<RoundResults>(`/events/${eventId}/guest-results${versionQuery(version)}`),
  allResults: (eventId: string, version?: number) =>
    apiFetch<RoundResults>(`/events/${eventId}/all-results${versionQuery(version)}`),
};
