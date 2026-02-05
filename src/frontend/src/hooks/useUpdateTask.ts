import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CreateTaskInput } from '../backend';

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: CreateTaskInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(id, input);
    },
    onSuccess: () => {
      // Invalidate all tasks queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
