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
import { useDeletePioneerHours } from '../../hooks/usePioneerHours';
import { Loader2 } from 'lucide-react';
import type { PioneerMonthlyHours } from '../../backend';

interface DeletePioneerHoursDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hoursRecord: PioneerMonthlyHours;
}

export default function DeletePioneerHoursDialog({
  isOpen,
  onClose,
  hoursRecord,
}: DeletePioneerHoursDialogProps) {
  const deleteHoursMutation = useDeletePioneerHours();

  const handleDelete = async () => {
    await deleteHoursMutation.mutateAsync({
      id: hoursRecord.id,
      pioneerId: hoursRecord.pioneerId,
      serviceYear: hoursRecord.serviceYear,
    });
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !deleteHoursMutation.isPending) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete hours for {hoursRecord.month}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {hoursRecord.hours.toString()} hours recorded for {hoursRecord.month}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteHoursMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteHoursMutation.isPending}
            style={{ backgroundColor: '#43587A' }}
            className="text-white hover:opacity-90"
          >
            {deleteHoursMutation.isPending ? (
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
