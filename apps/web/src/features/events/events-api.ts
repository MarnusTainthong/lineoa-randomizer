import type {
  DrawResponse,
  EventDetail,
  EventSummary,
  InvitePreview,
  ParticipantView,
} from '@line-oa-randomizer/shared';
import { apiFetch } from '../../lib/api-client';

export interface EventFormValues {
  name: string;
  allowViewAllResults?: boolean;
}

export const eventsApi = {
  list: (scope: 'organized' | 'joined') => apiFetch<EventSummary[]>(`/events?scope=${scope}`),
  detail: (eventId: string) => apiFetch<EventDetail>(`/events/${eventId}`),
  create: (values: EventFormValues) =>
    apiFetch<EventDetail>('/events', { method: 'POST', body: values }),
  update: (eventId: string, values: Partial<EventFormValues> & { status?: 'CLOSED' }) =>
    apiFetch<EventDetail>(`/events/${eventId}`, { method: 'PATCH', body: values }),
  previewInvite: (inviteCode: string) => apiFetch<InvitePreview>(`/events/invite/${inviteCode}`),
  join: (inviteCode: string) =>
    apiFetch<{ eventId: string }>('/events/join', { method: 'POST', body: { inviteCode } }),
  addGuests: (eventId: string, names: string[]) =>
    apiFetch<ParticipantView[]>(`/events/${eventId}/participants`, {
      method: 'POST',
      body: { names },
    }),
  removeParticipant: (eventId: string, participantId: string) =>
    apiFetch<void>(`/events/${eventId}/participants/${participantId}`, { method: 'DELETE' }),
  draw: (eventId: string) => apiFetch<DrawResponse>(`/events/${eventId}/draw`, { method: 'POST' }),
  redraw: (eventId: string) =>
    apiFetch<DrawResponse>(`/events/${eventId}/redraw`, { method: 'POST' }),
};
