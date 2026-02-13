import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AddGroupVisitInput } from '@/backend';

interface CreateGroupVisitInput {
  groupNumber: number;
  visitDate: bigint;
  discussionTopics: string;
  publishersPresent: string[];
  publisherNamesPresent: string[];
  notesForOverseer: string;
  notesForAssistant: string;
  nextPlannedVisitDate: bigint | null;
}

export function useCreateGroupVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupVisitInput) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      const backendInput: AddGroupVisitInput = {
        groupNumber: BigInt(input.groupNumber),
        visitDate: input.visitDate,
        discussionTopics: input.discussionTopics,
        publishersPresent: input.publishersPresent,
        publisherNamesPresent: input.publisherNamesPresent,
        notesForOverseer: input.notesForOverseer,
        notesForAssistant: input.notesForAssistant,
        nextPlannedVisitDate: input.nextPlannedVisitDate ?? undefined,
      };

      return actor.addGroupVisit(backendInput);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific group's cache
      queryClient.invalidateQueries({ queryKey: ['groupVisits', variables.groupNumber] });
      // Also invalidate the base key for safety
      queryClient.invalidateQueries({ queryKey: ['groupVisits'] });
    },
  });
}
