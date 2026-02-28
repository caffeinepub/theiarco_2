import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CreateTrainedConductorInput } from '../backend';
import { toast } from 'sonner';

/**
 * React Query mutation hook for creating a trained conductor.
 * Invalidates the trainedConductors query on success.
 */
export function useCreateTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainedConductorInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrainedConductor(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      toast.success('Conductor added successfully!', { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add conductor: ${error.message}`, { duration: 3000 });
    },
  });
}
