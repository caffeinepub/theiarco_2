import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { MeetingAttendance } from '../backend';

interface UpdateMeetingAttendanceInput {
  id: string;
  meetingDate: Date;
  meetingType: string;
  publishersPresent: string[];
  publisherNamesPresent: string[];
}

export function useUpdateMeetingAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<MeetingAttendance, Error, UpdateMeetingAttendanceInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error('Actor not available');

      // Convert date to epoch seconds timestamp
      const meetingDateSeconds = BigInt(Math.floor(input.meetingDate.getTime() / 1000));

      return actor.updateMeetingAttendance(
        input.id,
        meetingDateSeconds,
        input.meetingType,
        input.publishersPresent,
        input.publisherNamesPresent
      );
    },
    onSuccess: () => {
      // Invalidate meeting attendance queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['meetingAttendance'] });
      toast.success('Attendance updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update attendance:', error);
      toast.error('Failed to update attendance');
    },
  });
}
