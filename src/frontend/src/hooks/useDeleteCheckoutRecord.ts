import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PublisherId } from "../backend";
import { useActor } from "./useActor";

export function useDeleteCheckoutRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      territoryId,
      publisherId,
      dateCheckedOut,
    }: {
      territoryId: string;
      publisherId: PublisherId;
      dateCheckedOut: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCheckoutRecord(
        territoryId,
        publisherId,
        dateCheckedOut,
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific territory query
      queryClient.invalidateQueries({
        queryKey: ["territory", variables.territoryId],
      });
      // Invalidate the territories list query
      queryClient.invalidateQueries({ queryKey: ["territories"] });
    },
  });
}
