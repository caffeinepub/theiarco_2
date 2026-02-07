import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ServiceMeetingConductor } from '../backend';

/**
 * React Query hook to fetch all Service Meeting Conductor assignments.
 * Returns an empty array while actor is initializing.
 */
export function useGetAllServiceMeetingConductors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ServiceMeetingConductor[]>({
    queryKey: ['serviceMeetingConductors'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllServiceMeetingConductors();
    },
    enabled: !!actor && !actorFetching,
  });
}
