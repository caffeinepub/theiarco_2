import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface CreateTerritoryInput {
  number: string;
  territoryType: string;
}

export function useCreateTerritory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTerritoryInput) => {
      if (!actor) throw new Error('Actor not available');

      // Generate a unique ID (timestamp + random)
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      return actor.createTerritory(
        id,
        input.number,
        input.territoryType,
        null, // status defaults to "Available"
        null  // notes defaults to empty string
      );
    },
    onSuccess: () => {
      // Invalidate and refetch territories
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}
