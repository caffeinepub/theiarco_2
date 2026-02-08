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
import { useDeleteTrainedConductor } from '../../hooks/useDeleteTrainedConductor';
import { Loader2 } from 'lucide-react';

interface DeleteConductorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductorId: string;
}

export default function DeleteConductorDialog({
  open,
  onOpenChange,
  conductorId,
}: DeleteConductorDialogProps) {
  const deleteMutation = useDeleteTrainedConductor();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(conductorId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this conductor?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the conductor record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            style={{ backgroundColor: '#43587A' }}
            className="text-white hover:opacity-90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
