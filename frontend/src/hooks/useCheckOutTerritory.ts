import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId } from '../backend';
import { normalizeToEpochSeconds } from '@/utils/territoryTime';

interface CheckOutTerritoryInput {
  territoryId: string;
  publisherId: PublisherId;
  isCampaign: boolean;
  dateCheckedOut: bigint;
}

export function useCheckOutTerritory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CheckOutTerritoryInput) => {
      if (!actor) throw new Error('Actor not available');
      
      // Defensively normalize to seconds before sending to backend
      const normalizedDate = normalizeToEpochSeconds(input.dateCheckedOut);
      
      return actor.checkOutTerritory(
        input.territoryId,
        input.publisherId,
        input.isCampaign,
        normalizedDate
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
