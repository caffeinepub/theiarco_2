import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TerritoryNote, CreateTerritoryNoteInput } from '../backend';

export function useGetAllTerritoryNotes(territoryId: string) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useQuery<TerritoryNote[]>({
    queryKey: ['territoryNotes', territoryId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTerritoryNotes(territoryId);
    },
    enabled: !!actor && !isFetching && !!territoryId,
  });
}

export function useCreateTerritoryNote(territoryId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTerritoryNoteInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTerritoryNote(territoryId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territoryNotes', territoryId] });
    },
  });
}

export function useUpdateTerritoryNote(territoryId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, input }: { noteId: bigint; input: CreateTerritoryNoteInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTerritoryNote(territoryId, noteId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territoryNotes', territoryId] });
    },
  });
}

export function useDeleteTerritoryNote(territoryId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTerritoryNote(territoryId, noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['territoryNotes', territoryId] });
    },
  });
}
