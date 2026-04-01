import { useQuery } from "@tanstack/react-query";
import type { Pioneer } from "../backend";
import { useActor } from "./useActor";

// Query to get all pioneers
export function useGetAllPioneers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Pioneer[]>({
    queryKey: ["pioneers"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllPioneers();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Query to get a single pioneer by ID
export function useGetPioneer(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Pioneer | null>({
    queryKey: ["pioneer", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPioneer(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}
