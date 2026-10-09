import { useMutation, useQuery } from '@tanstack/react-query';
import { useInvalidateEvent } from '../events/use-events';
import { resultsApi } from './results-api';

export const useMyResult = (eventId: string) =>
  useQuery({ queryKey: ['event-data', eventId, 'my-result'], queryFn: () => resultsApi.myResult(eventId) });

export const useMyHistory = (eventId: string, isEnabled: boolean) =>
  useQuery({
    queryKey: ['event-data', eventId, 'my-history'],
    queryFn: () => resultsApi.myHistory(eventId),
    enabled: isEnabled,
  });

export const useGuestResults = (eventId: string, version?: number) =>
  useQuery({
    queryKey: ['event-data', eventId, 'guest-results', version ?? 'current'],
    queryFn: () => resultsApi.guestResults(eventId, version),
  });

export const useRoundRules = (eventId: string, version: number) =>
  useQuery({
    queryKey: ['event-data', eventId, 'round-rules', version],
    queryFn: () => resultsApi.roundRules(eventId, version),
  });

export const useAllResults = (eventId: string, version?: number) =>
  useQuery({
    queryKey: ['event-data', eventId, 'all-results', version ?? 'current'],
    queryFn: () => resultsApi.allResults(eventId, version),
  });

export function useAcknowledgeDraw(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: () => resultsApi.acknowledge(eventId),
    onSuccess: () => invalidateEvent(eventId),
  });
}
