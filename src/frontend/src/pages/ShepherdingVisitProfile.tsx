import { useState } from 'react';
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

  const [notes, setNotes] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize notes when visit loads
  useState(() => {
    if (visit) {
      setNotes(visit.notes);
    }
  });

  // Update notes when visit changes
  if (visit && notes !== visit.notes && !updateNotes.isPending) {
    setNotes(visit.notes);
  }

  const activePublishers = allPublishers?.filter((p) => p.isActive).sort((a, b) => a.fullName.localeCompare(b.fullName)) || [];

  const handleBackClick = () => {
    navigate({ to: '/shepherding' });
  };

  const handleSaveNotes = async () => {
    if (!visit) return;

    try {
      await updateNotes.mutateAsync({
        id: visit.id,
        notes: notes,
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
          <span className="text-muted-foreground">Loading visit...</span>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Visit not found</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shepherding Visits
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          onClick={handleBackClick}
          variant="ghost"
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shepherding Visits
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {visit.publisherName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleEditClick}
              variant="outline"
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Visit Details */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visit Date */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Visit Date
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {formatVisitDate(visit.visitDate)}
            </p>
          </div>

          {/* Elders Present */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Elders Present
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {visit.eldersPresent}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Notes</h2>
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Visit Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this visit..."
                className="mt-2 min-h-[200px]"
              />
            </div>
            <Button
              onClick={handleSaveNotes}
              disabled={updateNotes.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {updateNotes.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
