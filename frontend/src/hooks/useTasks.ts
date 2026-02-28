import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TaskStatus } from '../backend';
import type { Task } from '../backend';

// Query to get tasks filtered by status
export function useGetTasks(status: TaskStatus) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', status],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTasks(status);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Query to get a single task by ID
export function useGetTask(id: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task | null>({
    queryKey: ['task', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTask(id);
    },
    enabled: !!actor && !actorFetching,
  });
}
