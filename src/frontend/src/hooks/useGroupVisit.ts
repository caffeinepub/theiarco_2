import { useQuery } from "@tanstack/react-query";
import type { GroupVisit } from "../backend";
import { useActor } from "./useActor";

export function useGroupVisit(visitId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GroupVisit | null>({
    queryKey: ["groupVisit", visitId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGroupVisit(visitId);
    },
    enabled: !!actor && !actorFetching && !!visitId,
  });
}
