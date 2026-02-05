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
import { useDeleteTerritoryNote } from '../../hooks/useTerritoryNotes';
import type { TerritoryNote } from '../../backend';
import { toast } from 'sonner';

interface DeleteTerritoryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: TerritoryNote;
  territoryId: string;
}

export function DeleteTerritoryNoteDialog({
  open,
  onOpenChange,
  note,
  territoryId,
}: DeleteTerritoryNoteDialogProps) {
  const deleteNote = useDeleteTerritoryNote(territoryId);

  const handleDelete = async () => {
    try {
      await deleteNote.mutateAsync(note.id);

      toast.success('Note deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
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
