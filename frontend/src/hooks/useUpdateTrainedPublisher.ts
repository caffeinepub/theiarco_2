import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface UpdateTrainedPublisherInput {
  publisherId: string;
  publisherName: string;
  trainingDate: bigint;
  isAuthorized: boolean;
  hasS148Received: boolean;
}

export function useUpdateTrainedPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTrainedPublisherInput }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Update the trained publisher
      await actor.updateTrainedPublisher(id, {
        publisherId: input.publisherId,
        publisherName: input.publisherName,
        trainingDate: input.trainingDate,
        isAuthorized: input.isAuthorized,
      });
      
      // Update the S-148 status separately
      await actor.setS148Received(id, input.hasS148Received);
      
      return;
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
