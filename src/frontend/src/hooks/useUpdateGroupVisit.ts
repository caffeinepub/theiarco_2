import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface UpdateGroupVisitInput {
  id: string;
  groupNumber: number;
  visitDate: bigint;
  discussionTopics: string;
  publishersPresent: string[];
  publisherNamesPresent: string[];
  notesForOverseer: string;
  notesForAssistant: string;
  nextPlannedVisitDate: bigint | null;
}

export function useUpdateGroupVisit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateGroupVisitInput) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      await actor.updateGroupVisit(
        input.id,
        BigInt(input.groupNumber),
        input.visitDate,
        input.discussionTopics,
        input.publishersPresent,
        input.publisherNamesPresent,
        input.notesForOverseer,
        input.notesForAssistant,
        input.nextPlannedVisitDate
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific group's visits
      queryClient.invalidateQueries({ queryKey: ['groupVisits', variables.groupNumber] });
      // Invalidate the base groupVisits query
      queryClient.invalidateQueries({ queryKey: ['groupVisits'] });
      // Invalidate the specific visit detail
      queryClient.invalidateQueries({ queryKey: ['groupVisit', variables.id] });
    },
  });
}
