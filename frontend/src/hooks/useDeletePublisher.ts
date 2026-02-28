import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId, Publisher } from '../backend';
import { toast } from 'sonner';

export function useDeletePublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: PublisherId) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deletePublisher(id);
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['publishers'] });

      // Snapshot the previous value
      const previousPublishers = queryClient.getQueryData<Publisher[]>(['publishers']);

      // Optimistically update to the new value
      if (previousPublishers) {
        queryClient.setQueryData<Publisher[]>(
          ['publishers'],
          previousPublishers.filter((p) => p.id !== deletedId)
        );
      }

      // Return a context object with the snapshotted value
      return { previousPublishers };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPublishers) {
        queryClient.setQueryData(['publishers'], context.previousPublishers);
      }
      toast.error('Failed to delete publisher', {
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['publishers'] });
    },
  });
}
