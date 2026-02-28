import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CreatePioneerInput } from '../backend';

export function useCreatePioneer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePioneerInput) => {
      if (!actor) throw new Error('Actor not available');

      const pioneerId = await actor.createPioneer(input);
      return pioneerId;
    },
    onSuccess: () => {
      // Invalidate pioneers list query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pioneers'] });
    },
  });
}
