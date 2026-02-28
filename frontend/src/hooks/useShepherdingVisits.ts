import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShepherdingVisit } from '../backend';

// Query to get all shepherding visits
export function useGetAllShepherdingVisits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShepherdingVisit[]>({
    queryKey: ['shepherdingVisits'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllShepherdingVisits();
    },
    enabled: !!actor && !actorFetching,
  });
}
