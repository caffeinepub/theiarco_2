import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId } from '../backend';

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
      return actor.checkOutTerritory(
        input.territoryId,
        input.publisherId,
        input.isCampaign,
        input.dateCheckedOut
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
