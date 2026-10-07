import type { AuthResponse, MockUserView } from '@line-oa-randomizer/shared';
import { apiFetch } from '../../lib/api-client';

export const DEV_IDENTITY_STORAGE_KEY = 'line-oa-randomizer.dev-identity';
export const REAL_ACCOUNT_IDENTITY = 'real';

export const devApi = {
  listMockUsers: () => apiFetch<MockUserView[]>('/dev/mock-users'),
  createMockUser: (displayName?: string) =>
    apiFetch<MockUserView>('/dev/mock-users', { method: 'POST', body: { displayName } }),
  loginAsMockUser: (mockUserId: string) =>
    apiFetch<AuthResponse>('/dev/auth/login', { method: 'POST', body: { mockUserId } }),
  addMockParticipants: (eventId: string, count: number) =>
    apiFetch<void>(`/dev/events/${eventId}/mock-participants`, { method: 'POST', body: { count } }),
};

/** Per-tab identity (sessionStorage) so several tabs can be different users at once. */
export function readDevIdentity(): string | null {
  return sessionStorage.getItem(DEV_IDENTITY_STORAGE_KEY);
}

export function writeDevIdentity(identity: string): void {
  sessionStorage.setItem(DEV_IDENTITY_STORAGE_KEY, identity);
}
