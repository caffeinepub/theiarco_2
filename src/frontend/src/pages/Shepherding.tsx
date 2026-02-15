import { useState, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
import { getPageThemeColor } from '@/theme/pageTheme';
import { getContrastColor } from '@/theme/colorUtils';
import { ThemedPrimaryButton } from '@/components/theming/ThemedPrimaryButton';
import { ThemedTableHeaderRow, ThemedTableHead } from '@/components/theming/ThemedTableHeaderRow';

export default function Shepherding() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<ShepherdingVisit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<ShepherdingVisit | null>(null);
  const [searchText, setSearchText] = useState('');

  const { data: visits = [], isLoading } = useGetAllShepherdingVisits();
  const { data: publishers = [] } = useGetAllPublishers();
  const deleteVisitMutation = useDeleteShepherdingVisit();

  // Filter visits by publisher name (case-insensitive)
  const filteredVisits = useMemo(() => {
    if (!searchText) return visits;
    return visits.filter((visit) =>
      visit.publisherName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [visits, searchText]);

  // Sort visits by date (most recent first)
  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => Number(b.visitDate) - Number(a.visitDate));
  }, [filteredVisits]);

  const handlePublisherClick = (publisherId: string) => {
    navigate({ to: `/publishers/${publisherId}` });
  };

  const handleVisitDateClick = (visitId: string) => {
    navigate({ to: `/shepherding/${visitId}` });
  };

  const handleEditClick = (visit: ShepherdingVisit) => {
    setSelectedVisit(visit);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedVisit(null);
  };

  const handleDeleteClick = (visit: ShepherdingVisit) => {
    setVisitToDelete(visit);
  };

  const handleDeleteConfirm = async () => {
    if (!visitToDelete) return;

    try {
      await deleteVisitMutation.mutateAsync(visitToDelete.id);
      toast.success('Visit deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to delete visit:', error);
      toast.error('Failed to delete visit. Please try again.');
    } finally {
      setVisitToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setVisitToDelete(null);
  };

  const headerTextColor = getContrastColor(themeColor);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Shepherding Visits</h1>
        <ThemedPrimaryButton
          themeColor={themeColor}
          onClick={() => setIsRecordModalOpen(true)}
        >
          Record Visit
        </ThemedPrimaryButton>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <Label htmlFor="search">Search by Publisher Name</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mt-2"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedVisits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {visits.length === 0
            ? "No visits recorded. Click 'Record Visit' to add one."
            : 'No visits match your search.'}
        </div>
      )}

      {/* Visits Table */}
      {!isLoading && sortedVisits.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor}>Publisher</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Visit Date</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Elders Present</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Actions</ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {sortedVisits.map((visit) => (
                <tr key={visit.id}>
                  <TableCell>
                    <button
                      className="text-primary hover:underline font-medium"
                      onClick={() => handlePublisherClick(visit.publisherId)}
                    >
                      {visit.publisherName}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      className="text-primary hover:underline"
                      onClick={() => handleVisitDateClick(visit.id)}
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
                        onClick={() => handleEditClick(visit)}
                        className="h-8 gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(visit)}
                        className="h-8 gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Record Visit Modal */}
      <RecordVisitModal
        open={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        publishers={publishers}
      />

      {/* Edit Visit Modal */}
      {selectedVisit && (
        <EditShepherdingVisitModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          visit={selectedVisit}
          publishers={publishers}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!visitToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this visit?</AlertDialogTitle>
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
