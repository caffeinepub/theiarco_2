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
import { useDeletePioneer } from '../../hooks/useDeletePioneer';
import { toast } from 'sonner';
import type { Pioneer } from '../../backend';

interface DeletePioneerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pioneer: Pioneer | null;
}

export default function DeletePioneerDialog({
  isOpen,
  onClose,
  pioneer,
}: DeletePioneerDialogProps) {
  const deletePioneerMutation = useDeletePioneer();

  const handleDelete = async () => {
    if (!pioneer) return;

    try {
      await deletePioneerMutation.mutateAsync(pioneer.id);

      // Success - show toast and close dialog
      toast.success('Pioneer deleted successfully!', {
        duration: 3000,
        style: {
          background: 'oklch(0.7 0.15 145)',
          color: 'white',
        },
      });

      onClose();
    } catch (error) {
      // Error - show error toast
      console.error('Failed to delete pioneer:', error);
      toast.error('Failed to delete pioneer. Please try again.');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this pioneer record?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePioneerMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePioneerMutation.isPending}
            style={{ backgroundColor: '#43587A' }}
            className="text-white hover:opacity-90"
          >
            {deletePioneerMutation.isPending ? 'Deleting...' : 'Yes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
