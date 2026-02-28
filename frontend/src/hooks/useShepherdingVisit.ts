import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ShepherdingVisit } from '../backend';

// Query to get a single shepherding visit by ID
export function useGetShepherdingVisit(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShepherdingVisit | null>({
    queryKey: ['shepherdingVisit', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getShepherdingVisit(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

// Mutation to update a shepherding visit
export function useUpdateShepherdingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      publisherId: string;
      publisherName: string;
      visitDate: bigint;
      eldersPresent: string;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShepherdingVisit(
        input.id,
        input.publisherId,
        input.publisherName,
        input.visitDate,
        input.eldersPresent,
        input.notes
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the single visit query
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisits'] });
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisit', variables.id] });
    },
  });
}

// Mutation to update only the notes field
export function useUpdateShepherdingVisitNotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get the current visit to preserve other fields
      const visit = await actor.getShepherdingVisit(input.id);
      if (!visit) throw new Error('Visit not found');

      return actor.updateShepherdingVisit(
        input.id,
        visit.publisherId,
        visit.publisherName,
        visit.visitDate,
        visit.eldersPresent,
        input.notes
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the single visit query
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisits'] });
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisit', variables.id] });
    },
  });
}

// Mutation to delete a shepherding visit
export function useDeleteShepherdingVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShepherdingVisit(id);
    },
    onSuccess: (_, id) => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['shepherdingVisits'] });
      // Remove the single visit from cache
      queryClient.removeQueries({ queryKey: ['shepherdingVisit', id] });
    },
  });
}
