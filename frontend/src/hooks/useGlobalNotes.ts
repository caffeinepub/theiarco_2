import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GlobalNote } from '../backend';

// Query to get all global notes
export function useGetAllGlobalNotes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GlobalNote[]>({
    queryKey: ['globalNotes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllGlobalNotes();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Query to get a single global note by ID
export function useGetGlobalNote(id: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GlobalNote | null>({
    queryKey: ['globalNote', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGlobalNote(id);
    },
    enabled: !!actor && !actorFetching,
  });
}
