import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Publisher } from '../backend';

// Query to get all publishers
export function useGetAllPublishers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Publisher[]>({
    queryKey: ['publishers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPublishers();
    },
    enabled: !!actor && !actorFetching,
  });
}
