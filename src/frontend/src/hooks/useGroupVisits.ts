import { useQuery } from "@tanstack/react-query";
import type { GroupVisit } from "../backend";
import { useActor } from "./useActor";

export function useGroupVisits(groupId: number) {
  const { actor, isFetching: actorFetching } = useActor();

  // Guard against invalid groupId to prevent runtime errors
  const isValidGroupId = Number.isFinite(groupId) && groupId > 0;

  return useQuery<GroupVisit[]>({
    queryKey: ["groupVisits", groupId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGroupVisitsForGroup(BigInt(groupId));
    },
    enabled: !!actor && !actorFetching && isValidGroupId,
  });
}
