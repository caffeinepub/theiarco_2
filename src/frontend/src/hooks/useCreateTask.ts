import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CreateTaskInput } from '../backend';

interface CreateTaskParams {
  title: string;
  dueDate: bigint;
  category: string;
  notes?: string;
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      
      const input: CreateTaskInput = {
        title: params.title,
        dueDate: params.dueDate,
        category: params.category,
        notes: params.notes,
        parentTaskId: undefined,
      };
      
      return actor.createTask(input);
    },
    onSuccess: () => {
      // Invalidate all task queries to refetch from backend
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
