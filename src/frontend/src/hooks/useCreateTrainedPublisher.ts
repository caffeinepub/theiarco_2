import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface CreateTrainedPublisherInput {
  publisherId: string;
  publisherName: string;
  trainingDate: bigint;
  hasS148Received: boolean;
}

export function useCreateTrainedPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainedPublisherInput) => {
      if (!actor) throw new Error('Actor not available');
      
      // Create the trained publisher first
      const id = await actor.addTrainedPublisher({
        publisherId: input.publisherId,
        publisherName: input.publisherName,
        trainingDate: input.trainingDate,
      });
      
      // Then update the S-148 status if needed
      if (input.hasS148Received) {
        await actor.setS148Received(id, true);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainedPublishers'] });
      toast.success('Trained publisher added successfully!', { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add trained publisher: ${error.message}`, { duration: 3000 });
    },
  });
}
