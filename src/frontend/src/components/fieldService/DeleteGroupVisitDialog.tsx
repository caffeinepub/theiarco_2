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
import { useDeleteGroupVisit } from '../../hooks/useDeleteGroupVisit';
import { toast } from 'sonner';

interface DeleteGroupVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitId: string;
  groupNumber: number;
  onDeleted?: () => void;
}

export function DeleteGroupVisitDialog({
  open,
  onOpenChange,
  visitId,
  groupNumber,
  onDeleted,
}: DeleteGroupVisitDialogProps) {
  const deleteGroupVisit = useDeleteGroupVisit();

  const handleConfirm = async () => {
    try {
      await deleteGroupVisit.mutateAsync({ visitId, groupNumber });
      toast.success('Group visit deleted successfully');
      onOpenChange(false);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error: any) {
      console.error('Delete group visit error:', error);
      toast.error(error.message || 'Failed to delete group visit');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this group visit?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the group visit record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteGroupVisit.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteGroupVisit.isPending ? 'Deleting...' : 'Yes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
