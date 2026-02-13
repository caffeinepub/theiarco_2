import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { useGetAllPioneers } from '../hooks/usePioneers';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import AddPioneerModal from '../components/pioneers/AddPioneerModal';
import EditPioneerModal from '../components/pioneers/EditPioneerModal';
import DeletePioneerDialog from '../components/pioneers/DeletePioneerDialog';
import PioneerTableRow from '../components/pioneers/PioneerTableRow';
import { buildPioneersCsv, downloadCsv, getServiceYearMonths } from '../utils/pioneersCsvExport';
import { toast } from 'sonner';
import type { Pioneer } from '../backend';

export default function Pioneers() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { data: pioneers, isLoading } = useGetAllPioneers();
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPioneer, setSelectedPioneer] = useState<Pioneer | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportToCsv = async () => {
    if (!actor || !pioneers || pioneers.length === 0) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);

    try {
      // Fetch monthly hours for all pioneers
      const pioneersData = await Promise.all(
        pioneers.map(async (pioneer) => {
          const monthlyHoursRecords = await actor.getPioneerHoursForServiceYear(
            pioneer.id,
            pioneer.serviceYear
          );

          // Build monthly hours map
          const monthlyHoursMap: Record<string, number> = {};
          monthlyHoursRecords.forEach((record) => {
            monthlyHoursMap[record.month] = Number(record.hours);
          });

          // Calculate total and average
          const totalHours = monthlyHoursRecords.reduce(
            (sum, record) => sum + Number(record.hours),
            0
          );
          const averageHours =
            monthlyHoursRecords.length > 0 ? totalHours / monthlyHoursRecords.length : 0;

          // Determine current status
          let currentStatus = 'No Entries';
          if (monthlyHoursRecords.length > 0) {
            currentStatus = averageHours >= 50 ? 'On Track' : 'Behind';
          }

          return {
            pioneerName: pioneer.publisherName,
            serviceYear: pioneer.serviceYear,
            totalHours,
            averageHours,
            currentStatus,
            monthlyHours: monthlyHoursMap,
          };
        })
      );

      // Sort by pioneer name alphabetically
      pioneersData.sort((a, b) => a.pioneerName.localeCompare(b.pioneerName));

      // Build and download CSV
      const csvContent = buildPioneersCsv(pioneersData);
      downloadCsv(csvContent, 'pioneers-export.csv');

      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
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
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportToCsv}
            disabled={isExporting || !pioneers || pioneers.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
          <Button
            onClick={handleAddPioneer}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            Add Pioneer
          </Button>
        </div>
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
