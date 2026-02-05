import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useDeleteGlobalNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteGlobalNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalNotes'] });
    },
  });
}
