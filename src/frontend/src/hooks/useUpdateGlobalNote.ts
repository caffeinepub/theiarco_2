import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PublisherId } from "../backend";
import { useActor } from "./useActor";

interface UpdateGlobalNoteParams {
  id: bigint;
  title: string;
  content: string;
  category: string;
  attachedPublisher?: PublisherId;
}

export function useUpdateGlobalNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateGlobalNoteParams) => {
      if (!actor) throw new Error("Actor not available");

      await actor.updateGlobalNote(
        params.id,
        params.title,
        params.content,
        params.category,
        params.attachedPublisher ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalNotes"] });
    },
  });
}
