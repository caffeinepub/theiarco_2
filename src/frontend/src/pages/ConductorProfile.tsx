import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useGetTrainedConductor, useUpdateTrainedConductorNotes, useDeleteTrainedConductor } from '../hooks/useTrainedConductor';
import { formatTrainingDate } from '../utils/formatters';
import ConductorModal from '../components/conductors/ConductorModal';
import { toast } from 'sonner';

export default function ConductorProfile() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const conductorId = id || '';

  const { data: conductor, isLoading } = useGetTrainedConductor(conductorId);
  const updateNotes = useUpdateTrainedConductorNotes();
  const deleteConductor = useDeleteTrainedConductor();

  const [draftNotes, setDraftNotes] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Initialize draft notes when conductor loads
  useEffect(() => {
    if (conductor) {
      setDraftNotes(conductor.notes || '');
    }
  }, [conductor?.id, conductor?.notes]);

  const handleBackClick = () => {
    navigate({ to: '/conductors' });
  };

  const handleSaveNotes = async () => {
    if (!conductor) return;

    try {
      await updateNotes.mutateAsync({
        id: conductor.id,
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
    if (conductor) {
      setDraftNotes(conductor.notes || '');
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conductor) return;

    try {
      await deleteConductor.mutateAsync(conductor.id);
      toast.success('Conductor deleted successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });
      navigate({ to: '/conductors' });
    } catch (error) {
      console.error('Failed to delete conductor:', error);
      toast.error('Failed to delete conductor');
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
          <p className="text-muted-foreground">Loading conductor details...</p>
        </div>
      </div>
    );
  }

  if (!conductor) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Conductor not found</p>
        </div>
      </div>
    );
  }

  const availableDays: string[] = [];
  if (conductor.availableThursday) availableDays.push('Thursday');
  if (conductor.availableFriday) availableDays.push('Friday');
  if (conductor.availableSaturday) availableDays.push('Saturday');
  if (conductor.availableSunday) availableDays.push('Sunday');

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
          <h1 className="text-3xl font-bold text-foreground">{conductor.publisherName}</h1>
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

      {/* Conductor Details Card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Training Date</Label>
            <p className="text-lg font-medium mt-1">{formatTrainingDate(conductor.trainingDate)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge
                variant={conductor.status === 'Available' ? 'default' : 'destructive'}
                className={
                  conductor.status === 'Available'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {conductor.status}
              </Badge>
            </div>
          </div>
          <div className="md:col-span-2">
            <Label className="text-sm font-medium text-muted-foreground">Available Days</Label>
            <div className="mt-1">
              {availableDays.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {availableDays.map((day) => (
                    <Badge key={day} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Label className="text-lg font-semibold">Notes</Label>
        <Textarea
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          placeholder="Add notes about this conductor..."
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

      {/* Edit Conductor Modal */}
      {conductor && (
        <ConductorModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          conductor={conductor}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conductor?</AlertDialogTitle>
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
