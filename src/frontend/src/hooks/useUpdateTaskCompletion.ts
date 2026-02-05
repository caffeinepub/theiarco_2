import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface UpdateTaskCompletionParams {
  id: bigint;
  isCompleted: boolean;
}

export function useUpdateTaskCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isCompleted }: UpdateTaskCompletionParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskCompletion(id, isCompleted);
    },
    onSuccess: () => {
      // Invalidate all task queries to refetch with updated completion status
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
