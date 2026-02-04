import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useGetPublisher } from '../hooks/useQueries';
import { useDeletePublisher } from '../hooks/useDeletePublisher';
import EditPublisherModal from '../components/publishers/EditPublisherModal';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';

export default function PublisherProfile() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const publisherId = id ? BigInt(id) : BigInt(0);
  const { data: publisher, isLoading } = useGetPublisher(publisherId);
  const deletePublisher = useDeletePublisher();

  // Helper function to render privilege text
  const renderPrivilegeText = (privileges: {
    publisher: boolean;
    servant: boolean;
    elder: boolean;
  }) => {
    if (privileges.elder) return 'Elder';
    if (privileges.servant) return 'Ministerial Servant';
    if (privileges.publisher) return 'Publisher';
    return 'Unbaptized Publisher';
  };

  const handleBackClick = () => {
    navigate({ to: '/publishers' });
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!publisher) return;

    try {
      await deletePublisher.mutateAsync(publisher.id);
      toast.success('Publisher deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
      // Navigate back to publishers list after successful deletion
      navigate({ to: '/publishers' });
    } catch (error) {
      // Error toast is handled in the mutation hook
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
          <span className="text-muted-foreground">Loading publisher...</span>
        </div>
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Publisher not found</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Publishers
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
          Back to Publishers
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {publisher.fullName}
            </h1>
            <div className="flex items-center gap-2">
              {publisher.isGroupOverseer && (
                <Badge variant="secondary">Group Overseer</Badge>
              )}
              {publisher.isGroupAssistant && (
                <Badge variant="secondary">Group Assistant</Badge>
              )}
              {!publisher.isActive && (
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  Inactive
                </Badge>
              )}
            </div>
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

      {/* Publisher Details */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Group Number */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Field Service Group
            </h3>
            <p className="text-lg font-semibold text-foreground">
              Group {publisher.fieldServiceGroup.toString()}
            </p>
          </div>

          {/* Privileges */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Privileges
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {renderPrivilegeText(publisher.privileges)}
            </p>
          </div>

          {/* Group Overseer Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Group Overseer
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {publisher.isGroupOverseer ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Group Assistant Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Group Assistant
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {publisher.isGroupAssistant ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {publisher && (
        <EditPublisherModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          publisher={publisher}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Publisher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {publisher.fullName}? This action cannot be undone.
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
