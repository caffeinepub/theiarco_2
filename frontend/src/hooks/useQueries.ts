import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Publisher, PublisherId } from '../backend';

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

// Query to get a single publisher by ID
export function useGetPublisher(id: PublisherId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Publisher | null>({
    queryKey: ['publisher', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPublisher(id);
    },
    enabled: !!actor && !actorFetching,
  });
}
