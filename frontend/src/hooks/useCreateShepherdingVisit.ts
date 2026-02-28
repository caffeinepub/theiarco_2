import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CreateShepherdingVisitInput } from '../backend';

export function useCreateShepherdingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateShepherdingVisitInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShepherdingVisit(input);
    },
    onSuccess: () => {
      // Invalidate shepherding visits query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisits'] });
    },
  });
}
