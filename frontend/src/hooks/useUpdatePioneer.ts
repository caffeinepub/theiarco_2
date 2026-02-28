import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { EditPioneerInput } from '../backend';

export function useUpdatePioneer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: EditPioneerInput }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editPioneer(id, input);
    },
    onSuccess: (_, variables) => {
      // Invalidate pioneers list query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pioneers'] });
      // Invalidate single pioneer query to refresh profile view
      queryClient.invalidateQueries({ queryKey: ['pioneer', variables.id] });
    },
  });
}
