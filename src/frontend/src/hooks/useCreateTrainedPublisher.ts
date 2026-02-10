import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { CreateTrainedPublisherInput } from '../backend';

export function useCreateTrainedPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainedPublisherInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrainedPublisher(input);
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
