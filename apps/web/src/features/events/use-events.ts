import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from './events-api';

export const eventKeys = {
  list: (scope: 'organized' | 'joined') => ['events', 'list', scope] as const,
  detail: (eventId: string) => ['events', 'detail', eventId] as const,
  eventScope: (eventId: string) => ['events', eventId] as const,
};

export const useEventList = (scope: 'organized' | 'joined') =>
  useQuery({ queryKey: eventKeys.list(scope), queryFn: () => eventsApi.list(scope) });

export const useEventDetail = (eventId: string) =>
  useQuery({ queryKey: eventKeys.detail(eventId), queryFn: () => eventsApi.detail(eventId) });

/** Anything that changes an event, its people, rules, or draw must refresh every related query. */
export function useInvalidateEvent() {
  const queryClient = useQueryClient();
  return (eventId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ['events'] });
    if (eventId) void queryClient.invalidateQueries({ queryKey: ['event-data', eventId] });
  };
}

export function useCreateEvent() {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({ mutationFn: eventsApi.create, onSuccess: () => invalidateEvent() });
}

export function useUpdateEvent(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: (values: Parameters<typeof eventsApi.update>[1]) => eventsApi.update(eventId, values),
    onSuccess: () => invalidateEvent(eventId),
  });
}

export function useAddGuests(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: (names: string[]) => eventsApi.addGuests(eventId, names),
    onSuccess: () => invalidateEvent(eventId),
  });
}

export function useRemoveParticipant(eventId: string) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: (participantId: string) => eventsApi.removeParticipant(eventId, participantId),
    onSuccess: () => invalidateEvent(eventId),
  });
}

export function useDraw(eventId: string, isRedraw: boolean) {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({
    mutationFn: () => (isRedraw ? eventsApi.redraw(eventId) : eventsApi.draw(eventId)),
    onSuccess: () => invalidateEvent(eventId),
  });
}

export function useJoinEvent() {
  const invalidateEvent = useInvalidateEvent();
  return useMutation({ mutationFn: eventsApi.join, onSuccess: () => invalidateEvent() });
}
