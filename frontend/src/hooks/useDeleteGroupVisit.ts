import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface DeleteGroupVisitInput {
  visitId: string;
  groupNumber: number;
}

export function useDeleteGroupVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId }: DeleteGroupVisitInput) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      await actor.deleteGroupVisit(visitId);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific group's visits
      queryClient.invalidateQueries({ queryKey: ['groupVisits', variables.groupNumber] });
      // Invalidate the base groupVisits query
      queryClient.invalidateQueries({ queryKey: ['groupVisits'] });
      // Remove the specific visit from cache
      queryClient.removeQueries({ queryKey: ['groupVisit', variables.visitId] });
    },
  });
}
