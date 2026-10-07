import type { RuleType, RuleView } from '@line-oa-randomizer/shared';
import { apiFetch } from '../../lib/api-client';

export interface RuleFormValues {
  type: RuleType;
  participantIds: string[];
  note?: string;
}

export const rulesApi = {
  list: (eventId: string) => apiFetch<RuleView[]>(`/events/${eventId}/rules`),
  create: (eventId: string, values: RuleFormValues) =>
    apiFetch<RuleView>(`/events/${eventId}/rules`, { method: 'POST', body: values }),
  update: (eventId: string, ruleId: string, values: Partial<RuleFormValues>) =>
    apiFetch<RuleView>(`/events/${eventId}/rules/${ruleId}`, { method: 'PATCH', body: values }),
  remove: (eventId: string, ruleId: string) =>
    apiFetch<void>(`/events/${eventId}/rules/${ruleId}`, { method: 'DELETE' }),
};
