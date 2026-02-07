import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Pioneer } from '../backend';

// Query to get all pioneers
export function useGetAllPioneers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Pioneer[]>({
    queryKey: ['pioneers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPioneers();
    },
    enabled: !!actor && !actorFetching,
  });
}
