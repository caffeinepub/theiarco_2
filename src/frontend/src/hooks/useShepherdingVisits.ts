import { useQuery } from "@tanstack/react-query";
import type { ShepherdingVisit } from "../backend";
import { useActor } from "./useActor";

// Query to get all shepherding visits
export function useGetAllShepherdingVisits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ShepherdingVisit[]>({
    queryKey: ["shepherdingVisits"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllShepherdingVisits();
    },
    enabled: !!actor && !actorFetching,
  });
}
