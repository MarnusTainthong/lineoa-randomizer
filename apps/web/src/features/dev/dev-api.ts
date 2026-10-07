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

export function clearDevIdentity(): void {
  sessionStorage.removeItem(DEV_IDENTITY_STORAGE_KEY);
}

function openMenu(): void {
  if (window.location.pathname === '/') window.location.reload();
  else window.location.assign('/');
}

/** Stores the chosen test user and opens the main menu. */
export function selectDevIdentity(identity: string): void {
  writeDevIdentity(identity);
  openMenu();
}

/** Drops the test user and returns to the picker. */
export function leaveDevIdentity(): void {
  clearDevIdentity();
  openMenu();
}
