import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PioneerMonthlyHours, CreatePioneerMonthlyHoursInput } from '../backend';
import { toast } from 'sonner';

// Query to get all monthly hours for a specific pioneer's service year
export function useGetPioneerHoursForServiceYear(pioneerId: string, serviceYear: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PioneerMonthlyHours[]>({
    queryKey: ['pioneerHours', pioneerId, serviceYear],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPioneerHoursForServiceYear(pioneerId, serviceYear);
    },
    enabled: !!actor && !actorFetching && !!pioneerId && !!serviceYear,
  });
}

// Query to get a single monthly hours record by ID
export function useGetPioneerHours(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PioneerMonthlyHours | null>({
    queryKey: ['pioneerHours', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPioneerHours(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

// Mutation to add pioneer hours
export function useAddPioneerHours() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePioneerMonthlyHoursInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPioneerHours(input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pioneerHours', variables.pioneerId, variables.serviceYear] });
      toast.success('Hours added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add hours');
    },
  });
}

// Mutation to update pioneer hours
export function useUpdatePioneerHours() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      pioneerId,
      month,
      hours,
      serviceYear,
    }: {
      id: string;
      pioneerId: string;
      month: string;
      hours: bigint;
      serviceYear: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePioneerHours(id, pioneerId, month, hours, serviceYear);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pioneerHours', variables.pioneerId, variables.serviceYear] });
      queryClient.invalidateQueries({ queryKey: ['pioneerHours', variables.id] });
      toast.success('Hours updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update hours');
    },
  });
}

// Mutation to delete pioneer hours
export function useDeletePioneerHours() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pioneerId, serviceYear }: { id: string; pioneerId: string; serviceYear: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePioneerHours(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pioneerHours', variables.pioneerId, variables.serviceYear] });
      toast.success('Hours deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete hours');
    },
  });
}
