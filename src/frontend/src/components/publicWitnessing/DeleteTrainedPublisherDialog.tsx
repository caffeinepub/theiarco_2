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
import { useDeleteTrainedPublisher } from '../../hooks/useDeleteTrainedPublisher';

interface DeleteTrainedPublisherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publisherId: string;
}

export default function DeleteTrainedPublisherDialog({
  open,
  onOpenChange,
  publisherId,
}: DeleteTrainedPublisherDialogProps) {
  const deleteMutation = useDeleteTrainedPublisher();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(publisherId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trained Publisher</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this trained publisher? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
