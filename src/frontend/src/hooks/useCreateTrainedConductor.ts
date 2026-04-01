import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateTrainedConductorInput } from "../backend";
import { useActor } from "./useActor";

/**
 * React Query mutation hook for creating a trained conductor.
 * Invalidates the trainedConductors query on success.
 */
export function useCreateTrainedConductor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainedConductorInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTrainedConductor(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainedConductors"] });
      toast.success("Conductor added successfully!", { duration: 3000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add conductor: ${error.message}`, {
        duration: 3000,
      });
    },
  });
}
