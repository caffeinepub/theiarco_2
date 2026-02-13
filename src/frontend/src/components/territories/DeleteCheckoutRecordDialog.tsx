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
import { useDeleteCheckoutRecord } from '../../hooks/useDeleteCheckoutRecord';
import type { CheckoutRecord } from '../../backend';
import { toast } from 'sonner';

interface DeleteCheckoutRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CheckoutRecord | null;
  territoryId: string;
}

export function DeleteCheckoutRecordDialog({
  open,
  onOpenChange,
  record,
  territoryId,
}: DeleteCheckoutRecordDialogProps) {
  const deleteCheckoutRecord = useDeleteCheckoutRecord();

  const handleDelete = async () => {
    if (!record) return;

    try {
      await deleteCheckoutRecord.mutateAsync({
        territoryId,
        publisherId: record.publisherId,
        dateCheckedOut: record.dateCheckedOut,
      });

      toast.success('Checkout record deleted', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete checkout record:', error);
      toast.error('Failed to delete checkout record');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this checkout record?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Yes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
