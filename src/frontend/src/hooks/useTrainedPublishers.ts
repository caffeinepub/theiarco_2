import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrainedPublisher } from '../backend';

export function useGetAllTrainedPublishers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrainedPublisher[]>({
    queryKey: ['trainedPublishers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTrainedPublishers();
    },
    enabled: !!actor && !actorFetching,
  });
}
