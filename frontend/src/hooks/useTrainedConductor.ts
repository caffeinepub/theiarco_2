import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TrainedServiceMeetingConductor } from '../backend';

// Query to get a single trained conductor by ID
export function useGetTrainedConductor(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrainedServiceMeetingConductor | null>({
    queryKey: ['trainedConductor', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTrainedConductor(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

// Mutation to update only the notes field
export function useUpdateTrainedConductorNotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Get the current conductor to preserve other fields
      const conductor = await actor.getTrainedConductor(input.id);
      if (!conductor) throw new Error('Conductor not found');

      return actor.updateTrainedConductor(input.id, {
        publisherId: conductor.publisherId,
        publisherName: conductor.publisherName,
        trainingDate: conductor.trainingDate,
        status: conductor.status,
        availableThursday: conductor.availableThursday,
        availableFriday: conductor.availableFriday,
        availableSaturday: conductor.availableSaturday,
        availableSunday: conductor.availableSunday,
        notes: input.notes || undefined,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the single conductor query
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      queryClient.invalidateQueries({ queryKey: ['trainedConductor', variables.id] });
    },
  });
}

// Mutation to delete a trained conductor
export function useDeleteTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTrainedConductor(id);
    },
    onSuccess: (_, id) => {
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['trainedConductors'] });
      // Remove the single conductor from cache
      queryClient.removeQueries({ queryKey: ['trainedConductor', id] });
    },
  });
}
