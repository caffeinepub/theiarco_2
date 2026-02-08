import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

/**
 * React Query mutation hook for deleting a trained conductor.
 * Invalidates the trainedConductors query on success.
 */
export function useDeleteTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTrainedConductor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      toast.success('Conductor deleted successfully!', { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete conductor: ${error.message}`, { duration: 3000 });
    },
  });
}
