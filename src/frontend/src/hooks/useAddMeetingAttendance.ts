import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { MeetingAttendance } from '../backend';

interface AddMeetingAttendanceInput {
  groupNumber: number;
  meetingDate: Date;
  meetingType: string;
  publishersPresent: string[];
  publisherNamesPresent: string[];
}

export function useAddMeetingAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<MeetingAttendance, Error, AddMeetingAttendanceInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error('Actor not available');

      // Convert date to epoch seconds timestamp
      const meetingDateSeconds = BigInt(Math.floor(input.meetingDate.getTime() / 1000));

      return actor.addMeetingAttendance(
        BigInt(input.groupNumber),
        meetingDateSeconds,
        input.meetingType,
        input.publishersPresent,
        input.publisherNamesPresent
      );
    },
    onSuccess: () => {
      // Invalidate any relevant queries if needed in the future
      queryClient.invalidateQueries({ queryKey: ['meetingAttendance'] });
      toast.success('Attendance recorded successfully');
    },
    onError: (error) => {
      console.error('Failed to record attendance:', error);
      toast.error('Failed to record attendance');
    },
  });
}
