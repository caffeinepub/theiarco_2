import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useDeletePioneer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePioneer(id);
    },
    onSuccess: () => {
      // Invalidate pioneers list query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pioneers'] });
    },
  });
}
