import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useDeleteTrainedPublisher() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTrainedPublisher(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainedPublishers"] });
      toast.success("Trained publisher deleted successfully!", {
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete trained publisher: ${error.message}`, {
        duration: 3000,
      });
    },
  });
}
