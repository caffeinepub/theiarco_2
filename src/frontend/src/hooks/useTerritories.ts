import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Territory } from '../backend';

// Query to get all territories
export function useGetAllTerritories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Territory[]>({
    queryKey: ['territories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTerritories();
    },
    enabled: !!actor && !actorFetching,
  });
}
