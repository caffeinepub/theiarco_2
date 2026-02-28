import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useGetShepherdingVisit, useUpdateShepherdingVisitNotes, useDeleteShepherdingVisit } from '../hooks/useShepherdingVisit';
import { useGetAllPublishers } from '../hooks/useQueries';
import { formatVisitDate } from '../utils/formatters';
import { EditShepherdingVisitModal } from '../components/shepherding/EditShepherdingVisitModal';
import { toast } from 'sonner';

export default function ShepherdingVisitProfile() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const visitId = id || '';

  const { data: visit, isLoading } = useGetShepherdingVisit(visitId);
  const { data: allPublishers } = useGetAllPublishers();
  const updateNotes = useUpdateShepherdingVisitNotes();
  const deleteVisit = useDeleteShepherdingVisit();

  const [draftNotes, setDraftNotes] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize draft notes when visit loads
  useEffect(() => {
    if (visit) {
      setDraftNotes(visit.notes);
    }
  }, [visit?.id, visit?.notes]);

  const activePublishers = allPublishers?.filter((p) => p.isActive).sort((a, b) => a.fullName.localeCompare(b.fullName)) || [];

  const handleBackClick = () => {
    navigate({ to: '/shepherding' });
  };

  const handleSaveNotes = async () => {
    if (!visit) return;

    try {
      await updateNotes.mutateAsync({
        id: visit.id,
        notes: draftNotes,
      });

      toast.success('Notes saved successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes. Please try again.');
    }
  };

  const handleCancelNotes = () => {
    if (visit) {
      setDraftNotes(visit.notes);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!visit) return;

    try {
      await deleteVisit.mutateAsync(visit.id);
      toast.success('Visit deleted successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });
      navigate({ to: '/shepherding' });
    } catch (error) {
      console.error('Failed to delete visit:', error);
      toast.error('Failed to delete visit');
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <p className="text-muted-foreground">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Visit not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Visit Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Visit Details Card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Publisher Name</Label>
            <p className="text-lg font-medium mt-1">{visit.publisherName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Visit Date</Label>
            <p className="text-lg font-medium mt-1">{formatVisitDate(visit.visitDate)}</p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm font-medium text-muted-foreground">Elders Present</Label>
            <p className="text-lg font-medium mt-1">{visit.eldersPresent}</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Label className="text-lg font-semibold">Notes</Label>
        <Textarea
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          placeholder="Add notes about this visit..."
          rows={8}
          className="resize-none"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveNotes}
            disabled={updateNotes.isPending}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {updateNotes.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelNotes}
            disabled={updateNotes.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Edit Visit Modal */}
      {visit && (
        <EditShepherdingVisitModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          visit={visit}
          publishers={activePublishers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this visit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
