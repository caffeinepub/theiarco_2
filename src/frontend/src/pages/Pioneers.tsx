import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllPioneers } from '../hooks/usePioneers';
import { useGetAllPublishers } from '../hooks/useQueries';
import AddPioneerModal from '../components/pioneers/AddPioneerModal';
import EditPioneerModal from '../components/pioneers/EditPioneerModal';
import DeletePioneerDialog from '../components/pioneers/DeletePioneerDialog';
import PioneerTableRow from '../components/pioneers/PioneerTableRow';
import type { Pioneer } from '../backend';

export default function Pioneers() {
  const navigate = useNavigate();
  const { data: pioneers, isLoading } = useGetAllPioneers();
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPioneer, setSelectedPioneer] = useState<Pioneer | null>(null);

  const handleAddPioneer = () => {
    setIsAddModalOpen(true);
  };

  const handleEditPioneer = (pioneer: Pioneer) => {
    setSelectedPioneer(pioneer);
    setIsEditModalOpen(true);
  };

  const handleDeletePioneer = (pioneer: Pioneer) => {
    setSelectedPioneer(pioneer);
    setIsDeleteDialogOpen(true);
  };

  const handlePioneerClick = (pioneerId: string) => {
    navigate({ to: '/pioneers/$id', params: { id: pioneerId } });
  };

  // Sort pioneers alphabetically by publisher name
  const sortedPioneers = pioneers
    ? [...pioneers].sort((a, b) => a.publisherName.localeCompare(b.publisherName))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Pioneers</h1>
        <Button
          onClick={handleAddPioneer}
          style={{ backgroundColor: '#43587A', color: 'white' }}
          className="hover:opacity-90"
        >
          Add Pioneer
        </Button>
      </div>

      {/* Add Pioneer Modal */}
      <AddPioneerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        publishers={publishers}
        publishersLoading={publishersLoading}
      />

      {/* Edit Pioneer Modal */}
      <EditPioneerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPioneer(null);
        }}
        pioneer={selectedPioneer}
        publishers={publishers}
        publishersLoading={publishersLoading}
      />

      {/* Delete Pioneer Dialog */}
      <DeletePioneerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPioneer(null);
        }}
        pioneer={selectedPioneer}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedPioneers.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No pioneers added. Click 'Add Pioneer' to create one.
          </p>
        </div>
      )}

      {/* Pioneers Table */}
      {!isLoading && sortedPioneers.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Service Year</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Average Hours</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPioneers.map((pioneer) => (
                <PioneerTableRow
                  key={pioneer.id}
                  pioneer={pioneer}
                  onPioneerClick={handlePioneerClick}
                  onEdit={handleEditPioneer}
                  onDelete={handleDeletePioneer}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
