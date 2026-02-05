import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Territory } from '../backend';

// Query to get a single territory by ID
export function useGetTerritory(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Territory | null>({
    queryKey: ['territory', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTerritory(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

// Mutation to update a territory
interface UpdateTerritoryInput {
  id: string;
  number: string;
  territoryType: string;
}

export function useUpdateTerritory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTerritoryInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTerritory(input.id, input.number, input.territoryType);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific territory query
      queryClient.invalidateQueries({ queryKey: ['territory', variables.id] });
      // Invalidate the territories list
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}

// Mutation to delete a territory
export function useDeleteTerritory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTerritory(id);
    },
    onSuccess: (_, id) => {
      // Remove the specific territory from cache
      queryClient.removeQueries({ queryKey: ['territory', id] });
      // Invalidate the territories list
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}

// Mutation to mark a territory as returned
export function useMarkTerritoryReturned() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (territoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTerritoryReturned(territoryId);
    },
    onSuccess: (_, territoryId) => {
      // Invalidate the specific territory query
      queryClient.invalidateQueries({ queryKey: ['territory', territoryId] });
      // Invalidate the territories list
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}

// Mutation to make a territory available
export function useMakeTerritoryAvailable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (territoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.makeTerritoryAvailable(territoryId);
    },
    onSuccess: (_, territoryId) => {
      // Invalidate the specific territory query
      queryClient.invalidateQueries({ queryKey: ['territory', territoryId] });
      // Invalidate the territories list
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
  });
}
