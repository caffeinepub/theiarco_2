import { useQuery } from "@tanstack/react-query";
import type { TrainedServiceMeetingConductor } from "../backend";
import { useActor } from "./useActor";

/**
 * React Query hook to fetch all trained Service Meeting Conductors.
 * Returns an empty array while actor is initializing.
 */
export function useGetAllTrainedConductors() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TrainedServiceMeetingConductor[]>({
    queryKey: ["trainedConductors"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllTrainedConductors();
    },
    enabled: !!actor && !actorFetching,
  });
}
