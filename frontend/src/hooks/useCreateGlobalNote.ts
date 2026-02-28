import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PublisherId } from '../backend';

interface CreateGlobalNoteParams {
  title: string;
  content: string;
  category: string;
  attachedPublisher?: PublisherId;
}

export function useCreateGlobalNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateGlobalNoteParams) => {
      if (!actor) throw new Error('Actor not available');

      // Validate required fields
      if (!params.title.trim()) {
        throw new Error('Title is required');
      }
      if (!params.content.trim()) {
        throw new Error('Content is required');
      }
      if (!params.category) {
        throw new Error('Category is required');
      }

      // Only include attachedPublisher if category is "Publishers"
      const attachedPublisher = params.category === 'Publishers' && params.attachedPublisher
        ? params.attachedPublisher
        : null;

      const noteId = await actor.createGlobalNote(
        params.title.trim(),
        params.content.trim(),
        params.category,
        attachedPublisher
      );

      return noteId;
    },
    onSuccess: () => {
      // Invalidate only global notes queries
      queryClient.invalidateQueries({ queryKey: ['globalNotes'] });
    },
  });
}
