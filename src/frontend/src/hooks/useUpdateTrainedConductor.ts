import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UpdateTrainedConductorInput } from '../backend';
import { toast } from 'sonner';

/**
 * React Query mutation hook for updating a trained conductor.
 * Invalidates the trainedConductors query on success.
 */
export function useUpdateTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTrainedConductorInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainedConductor(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      toast.success('Conductor updated successfully!', { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update conductor: ${error.message}`, { duration: 3000 });
    },
  });
}
