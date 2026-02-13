import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UpdateTrainedConductorInput } from '../backend';
import { toast } from 'sonner';

export function useUpdateTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTrainedConductorInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainedConductor(id, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      // Also invalidate the single conductor query
      queryClient.invalidateQueries({ queryKey: ['trainedConductor', variables.id] });
      toast.success('Conductor updated successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });
    },
  });
}
