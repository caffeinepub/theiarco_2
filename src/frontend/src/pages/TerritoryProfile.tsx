import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useGetTerritory, useDeleteTerritory, useMarkTerritoryReturned, useMakeTerritoryAvailable } from '../hooks/useTerritory';
import { EditTerritoryModal } from '../components/territories/EditTerritoryModal';
import { TerritoryNotesSection } from '../components/territories/TerritoryNotesSection';
import { CheckOutTerritoryModal } from '../components/territories/CheckOutTerritoryModal';
import { EditCheckoutRecordModal } from '../components/territories/EditCheckoutRecordModal';
import { DeleteCheckoutRecordDialog } from '../components/territories/DeleteCheckoutRecordDialog';
import { CheckoutHistoryTable } from '../components/territories/CheckoutHistoryTable';
import type { CheckoutRecord } from '../backend';
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

export default function TerritoryProfile() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isEditCheckoutModalOpen, setIsEditCheckoutModalOpen] = useState(false);
  const [isDeleteCheckoutDialogOpen, setIsDeleteCheckoutDialogOpen] = useState(false);
  const [selectedCheckoutRecord, setSelectedCheckoutRecord] = useState<CheckoutRecord | null>(null);

  const territoryId = id || '';
  const { data: territory, isLoading } = useGetTerritory(territoryId);
  const deleteTerritory = useDeleteTerritory();
  const markReturned = useMarkTerritoryReturned();
  const makeAvailable = useMakeTerritoryAvailable();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-600 text-white hover:bg-green-700';
      case 'Checked Out':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'Under Review':
        return 'bg-orange-600 text-white hover:bg-orange-700';
      default:
        return 'bg-gray-600 text-white hover:bg-gray-700';
    }
  };

  const handleBackClick = () => {
    navigate({ to: '/territories' });
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
    if (!territory) return;

    try {
      await deleteTerritory.mutateAsync(territory.id);
      toast.success('Territory deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
      // Navigate back to territories list after successful deletion
      navigate({ to: '/territories' });
    } catch (error) {
      console.error('Failed to delete territory:', error);
      toast.error('Failed to delete territory');
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleCheckOutClick = () => {
    setIsCheckOutModalOpen(true);
  };

  const handleEditCheckoutRecord = (record: CheckoutRecord) => {
    setSelectedCheckoutRecord(record);
    setIsEditCheckoutModalOpen(true);
  };

  const handleDeleteCheckoutRecord = (record: CheckoutRecord) => {
    setSelectedCheckoutRecord(record);
    setIsDeleteCheckoutDialogOpen(true);
  };

  const handleEditCheckoutSuccess = () => {
    setSelectedCheckoutRecord(null);
  };

  const handleMarkReturnedClick = async () => {
    if (!territory) return;

    try {
      await markReturned.mutateAsync(territory.id);
      toast.success('Territory marked as returned!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to mark territory as returned:', error);
      toast.error('Failed to mark territory as returned');
    }
  };

  const handleMakeAvailableClick = async () => {
    if (!territory) return;

    try {
      await makeAvailable.mutateAsync(territory.id);
      toast.success('Territory is now available!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to make territory available:', error);
      toast.error('Failed to make territory available');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading territory...</span>
        </div>
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Territory not found</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Territories
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
          Back to Territories
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {territory.number}
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

      {/* Territory Details */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Type
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {territory.territoryType}
            </p>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Status
            </h3>
            <Badge className={getStatusColor(territory.status)}>
              {territory.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Territory Notes Section */}
      <TerritoryNotesSection territoryId={territoryId} />

      {/* Checkout History Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Checkout History</h2>
          {territory.status === 'Available' && (
            <Button
              onClick={handleCheckOutClick}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              Check Out Territory
            </Button>
          )}
          {territory.status === 'Checked Out' && (
            <Button
              onClick={handleMarkReturnedClick}
              disabled={markReturned.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {markReturned.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                'Mark as Returned'
              )}
            </Button>
          )}
          {territory.status === 'Under Review' && (
            <Button
              onClick={handleMakeAvailableClick}
              disabled={makeAvailable.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {makeAvailable.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Make Available'
              )}
            </Button>
          )}
        </div>

        <CheckoutHistoryTable 
          checkOutHistory={territory.checkOutHistory}
          onEdit={handleEditCheckoutRecord}
          onDelete={handleDeleteCheckoutRecord}
        />
      </div>

      {/* Edit Modal */}
      {territory && (
        <EditTerritoryModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          territory={territory}
        />
      )}

      {/* Check Out Modal */}
      <CheckOutTerritoryModal
        open={isCheckOutModalOpen}
        onOpenChange={setIsCheckOutModalOpen}
        territoryId={territoryId}
      />

      {/* Edit Checkout Record Modal */}
      <EditCheckoutRecordModal
        open={isEditCheckoutModalOpen}
        onOpenChange={setIsEditCheckoutModalOpen}
        territoryId={territoryId}
        record={selectedCheckoutRecord}
        onSuccess={handleEditCheckoutSuccess}
      />

      {/* Delete Checkout Record Dialog */}
      <DeleteCheckoutRecordDialog
        open={isDeleteCheckoutDialogOpen}
        onOpenChange={setIsDeleteCheckoutDialogOpen}
        territoryId={territoryId}
        record={selectedCheckoutRecord}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this territory?</AlertDialogTitle>
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
