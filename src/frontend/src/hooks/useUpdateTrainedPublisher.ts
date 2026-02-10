import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { UpdateTrainedPublisherInput } from '../backend';

export function useUpdateTrainedPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTrainedPublisherInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainedPublisher(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainedPublishers'] });
      toast.success('Trained publisher updated successfully!', { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update trained publisher: ${error.message}`, { duration: 3000 });
    },
  });
}
