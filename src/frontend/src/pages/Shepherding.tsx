import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
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
import { useGetAllShepherdingVisits } from '../hooks/useShepherdingVisits';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useDeleteShepherdingVisit } from '../hooks/useShepherdingVisit';
import { formatVisitDate } from '../utils/formatters';
import RecordVisitModal from '../components/shepherding/RecordVisitModal';
import { EditShepherdingVisitModal } from '../components/shepherding/EditShepherdingVisitModal';
import { toast } from 'sonner';
import type { ShepherdingVisit } from '../backend';

export default function Shepherding() {
  const navigate = useNavigate();
  const { data: visits, isLoading } = useGetAllShepherdingVisits();
  const { data: allPublishers } = useGetAllPublishers();
  const deleteVisit = useDeleteShepherdingVisit();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<ShepherdingVisit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);

  // Filter and sort active publishers alphabetically by fullName
  const activePublishers = useMemo(() => {
    if (!allPublishers) return [];
    return allPublishers
      .filter((p) => p.isActive)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [allPublishers]);

  // Sort visits by date (most recent first) and filter by publisher name
  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    
    // Sort by visitDate descending (most recent first)
    const sorted = [...visits].sort((a, b) => {
      const dateA = Number(a.visitDate);
      const dateB = Number(b.visitDate);
      return dateB - dateA;
    });

    // Filter by search query
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sorted;
    
    return sorted.filter((visit) =>
      visit.publisherName.toLowerCase().includes(query)
    );
  }, [visits, searchQuery]);

  const handleRecordVisit = () => {
    setIsModalOpen(true);
  };

  const handleVisitClick = (visitId: string) => {
    navigate({ to: `/shepherding/${visitId}` });
  };

  const handleEditClick = (visit: ShepherdingVisit, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVisit(visit);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (visitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitToDelete(visitId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!visitToDelete) return;

    try {
      await deleteVisit.mutateAsync(visitToDelete);
      toast.success('Visit deleted successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });
      setShowDeleteDialog(false);
      setVisitToDelete(null);
    } catch (error) {
      console.error('Failed to delete visit:', error);
      toast.error('Failed to delete visit');
      setShowDeleteDialog(false);
      setVisitToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setVisitToDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Shepherding Visits</h1>
        <Button
          onClick={handleRecordVisit}
          style={{ backgroundColor: '#43587A', color: 'white' }}
          className="hover:opacity-90"
        >
          Record Visit
        </Button>
      </div>

      {/* Search Box */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search by publisher name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

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
      {!isLoading && filteredVisits.length === 0 && !searchQuery && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No shepherding visits recorded. Click 'Record Visit' to create one.
          </p>
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && filteredVisits.length === 0 && searchQuery && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No visits found matching "{searchQuery}"
          </p>
        </div>
      )}

      {/* Visits Table */}
      {!isLoading && filteredVisits.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Publisher Name</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Elders Present</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">
                    <button
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => handleVisitClick(visit.id)}
                    >
                      {visit.publisherName}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => handleVisitClick(visit.id)}
                    >
                      {formatVisitDate(visit.visitDate)}
                    </button>
                  </TableCell>
                  <TableCell>{visit.eldersPresent}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditClick(visit, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(visit.id, e)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Record Visit Modal */}
      <RecordVisitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        publishers={activePublishers}
      />

      {/* Edit Visit Modal */}
      {selectedVisit && (
        <EditShepherdingVisitModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          visit={selectedVisit}
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
