import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteMeetingAttendance } from '../../hooks/useDeleteMeetingAttendance';

interface DeleteAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceId: string;
  onDeleted?: () => void;
}

export function DeleteAttendanceDialog({
  open,
  onOpenChange,
  attendanceId,
  onDeleted,
}: DeleteAttendanceDialogProps) {
  const deleteMutation = useDeleteMeetingAttendance();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(attendanceId);
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error deleting attendance:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this attendance record?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the attendance record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Yes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
