import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId } from '../backend';
import { normalizeToEpochSeconds } from '@/utils/territoryTime';

interface UpdateCheckoutRecordInput {
  territoryId: string;
  originalPublisherId: PublisherId;
  originalDateCheckedOut: bigint;
  newPublisherId: PublisherId;
  newDateCheckedOut: bigint;
  newDateReturned: bigint | null;
  newIsCampaign: boolean;
}

export function useUpdateCheckoutRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCheckoutRecordInput) => {
      if (!actor) throw new Error('Actor not available');
      
      // Defensively normalize all timestamps to seconds before sending to backend
      const normalizedDateCheckedOut = normalizeToEpochSeconds(input.newDateCheckedOut);
      const normalizedDateReturned = input.newDateReturned 
        ? normalizeToEpochSeconds(input.newDateReturned)
        : null;
      
      return actor.updateCheckoutRecord(
        input.territoryId,
        input.originalPublisherId,
        input.originalDateCheckedOut,
        input.newPublisherId,
        normalizedDateCheckedOut,
        normalizedDateReturned,
        input.newIsCampaign
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific territory query to refresh the profile
      queryClient.invalidateQueries({ queryKey: ['territory', variables.territoryId] });
      // Invalidate the territories list
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}
