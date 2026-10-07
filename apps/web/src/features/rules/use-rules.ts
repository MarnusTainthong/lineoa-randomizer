import { useMutation, useQuery } from '@tanstack/react-query';
import { useInvalidateEvent } from '../events/use-events';
import { rulesApi, type RuleFormValues } from './rules-api';

export const useRules = (eventId: string) =>
  useQuery({ queryKey: ['event-data', eventId, 'rules'], queryFn: () => rulesApi.list(eventId) });

export function useCreateRule(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: (values: RuleFormValues) => rulesApi.create(eventId, values),
    onSuccess: () => invalidateEvent(eventId),
  });
}

export function useDeleteRule(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: (ruleId: string) => rulesApi.remove(eventId, ruleId),
    onSuccess: () => invalidateEvent(eventId),
  });
}
