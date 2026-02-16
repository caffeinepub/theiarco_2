import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MeetingAttendance } from '../backend';

export function useGetMeetingAttendance(groupNumber?: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MeetingAttendance[]>({
    queryKey: ['meetingAttendance', groupNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Call backend with optional groupNumber filter
      const result = await actor.getMeetingAttendance(
        groupNumber !== undefined ? BigInt(groupNumber) : null
      );
      
      return result;
    },
    enabled: !!actor && !actorFetching,
  });
}
