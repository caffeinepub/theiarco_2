import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useDeleteMeetingAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMeetingAttendance(id);
    },
    onSuccess: () => {
      // Invalidate all meeting attendance queries
      queryClient.invalidateQueries({ queryKey: ["meetingAttendance"] });
      toast.success("Attendance record deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting attendance record:", error);
      toast.error("Failed to delete attendance record");
    },
  });
}
