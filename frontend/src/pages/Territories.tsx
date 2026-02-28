import { useState, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Download, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetAllTerritories } from '../hooks/useTerritories';
import { useDeleteTerritory } from '../hooks/useTerritory';
import { AddTerritoryModal } from '../components/territories/AddTerritoryModal';
import { EditTerritoryModal } from '../components/territories/EditTerritoryModal';
import { toast } from 'sonner';
import type { Territory } from '../backend';
import { buildTerritoryAssignmentRecordCsv } from '../utils/territoryAssignmentRecordCsvExport';
import { getPageThemeColor } from '@/theme/pageTheme';
import { getContrastColor } from '@/theme/colorUtils';
import { ThemedPrimaryButton } from '@/components/theming/ThemedPrimaryButton';
import { ThemedTableHeaderRow, ThemedTableHead } from '@/components/theming/ThemedTableHeaderRow';
import { calculateCheckoutDuration, getCheckoutDurationMonths } from '@/utils/territoryTime';

type SortColumn = 'number' | 'publisher' | 'status' | 'type' | 'duration' | null;
type SortDirection = 'default' | 'asc' | 'desc';

export default function Territories() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(null);
  
  // Sort states
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');

  const { data: territories, isLoading } = useGetAllTerritories();
  const deleteTerritory = useDeleteTerritory();

  // Handle column header click for sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> default
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('default');
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      // New column clicked, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort indicator for a column
  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    if (sortDirection === 'asc') return ' ↑';
    if (sortDirection === 'desc') return ' ↓';
    return null;
  };

  // Helper to get current publisher name
  const getCurrentPublisher = (territory: Territory): string => {
    if (territory.status !== 'Checked Out') return '—';
    const currentCheckout = territory.checkOutHistory.find((record) => !record.dateReturned);
    return currentCheckout?.publisherName || '—';
  };

  // Helper to get checkout duration in months for sorting
  const getTerritoryDurationMonths = (territory: Territory): number | null => {
    if (territory.status !== 'Checked Out') return null;
    const currentCheckout = territory.checkOutHistory.find((record) => !record.dateReturned);
    if (!currentCheckout) return null;
    
    return getCheckoutDurationMonths(currentCheckout.dateCheckedOut);
  };

  // Helper to format checkout duration for display
  const formatCheckoutDuration = (territory: Territory): string => {
    if (territory.status !== 'Checked Out') return '—';
    const currentCheckout = territory.checkOutHistory.find((record) => !record.dateReturned);
    if (!currentCheckout) return '—';
    
    const duration = calculateCheckoutDuration(currentCheckout.dateCheckedOut);
    return duration.displayText;
  };

  // Compute displayed territories with sorting applied
  const displayedTerritories = useMemo(() => {
    if (!territories || territories.length === 0) return [];
    if (sortColumn === null || sortDirection === 'default') {
      return territories;
    }

    const sorted = [...territories].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'number': {
          comparison = a.number.localeCompare(b.number, undefined, { numeric: true });
          break;
        }

        case 'publisher': {
          const aPublisher = getCurrentPublisher(a);
          const bPublisher = getCurrentPublisher(b);
          comparison = aPublisher.localeCompare(bPublisher);
          break;
        }

        case 'status': {
          comparison = a.status.localeCompare(b.status);
          break;
        }

        case 'type': {
          comparison = a.territoryType.localeCompare(b.territoryType);
          break;
        }

        case 'duration': {
          const aDuration = getTerritoryDurationMonths(a) ?? -1;
          const bDuration = getTerritoryDurationMonths(b) ?? -1;
          comparison = aDuration - bDuration;
          break;
        }

        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [territories, sortColumn, sortDirection]);

  const handleTerritoryClick = (territoryId: string) => {
    navigate({ to: `/territories/${territoryId}` });
  };

  const handleEditClick = (e: React.MouseEvent, territory: Territory) => {
    e.stopPropagation();
    setSelectedTerritory(territory);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedTerritory(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, territory: Territory) => {
    e.stopPropagation();
    setTerritoryToDelete(territory);
  };

  const handleDeleteConfirm = async () => {
    if (!territoryToDelete) return;

    try {
      await deleteTerritory.mutateAsync(territoryToDelete.id);
      toast.success('Territory deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to delete territory:', error);
      toast.error('Failed to delete territory. Please try again.');
    } finally {
      setTerritoryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setTerritoryToDelete(null);
  };

  const handleExportCsv = () => {
    if (!territories || territories.length === 0) {
      toast.error('No territories to export');
      return;
    }

    try {
      const csvContent = buildTerritoryAssignmentRecordCsv(territories);
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'territory-assignment-record.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Territory history exported successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to export territory history:', error);
      toast.error('Failed to export territory history. Please try again.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-600 hover:bg-green-700';
      case 'Checked Out':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'Under Review':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return '';
    }
  };

  const headerTextColor = getContrastColor(themeColor);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Territories</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Territory History
          </Button>
          <ThemedPrimaryButton
            themeColor={themeColor}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Territory
          </ThemedPrimaryButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : displayedTerritories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No territories found. Click 'Add Territory' to get started.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor}>
                  <button
                    onClick={() => handleSort('number')}
                    className="w-full text-left font-medium cursor-pointer hover:opacity-80 px-2 py-1 -mx-2 -my-1 rounded transition-opacity"
                    style={{ color: headerTextColor }}
                  >
                    Territory Number{getSortIndicator('number')}
                  </button>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  <button
                    onClick={() => handleSort('publisher')}
                    className="w-full text-left font-medium cursor-pointer hover:opacity-80 px-2 py-1 -mx-2 -my-1 rounded transition-opacity"
                    style={{ color: headerTextColor }}
                  >
                    Publisher{getSortIndicator('publisher')}
                  </button>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  <button
                    onClick={() => handleSort('status')}
                    className="w-full text-left font-medium cursor-pointer hover:opacity-80 px-2 py-1 -mx-2 -my-1 rounded transition-opacity"
                    style={{ color: headerTextColor }}
                  >
                    Status{getSortIndicator('status')}
                  </button>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  <button
                    onClick={() => handleSort('type')}
                    className="w-full text-left font-medium cursor-pointer hover:opacity-80 px-2 py-1 -mx-2 -my-1 rounded transition-opacity"
                    style={{ color: headerTextColor }}
                  >
                    Type{getSortIndicator('type')}
                  </button>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>
                  <button
                    onClick={() => handleSort('duration')}
                    className="w-full text-left font-medium cursor-pointer hover:opacity-80 px-2 py-1 -mx-2 -my-1 rounded transition-opacity"
                    style={{ color: headerTextColor }}
                  >
                    Checked Out Duration{getSortIndicator('duration')}
                  </button>
                </ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Actions</ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {displayedTerritories.map((territory) => {
                const durationMonths = getTerritoryDurationMonths(territory);
                const isOverdue = durationMonths !== null && durationMonths >= 4;

                return (
                  <tr
                    key={territory.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      isOverdue ? 'bg-red-100 dark:bg-red-900/20' : ''
                    }`}
                    onClick={() => handleTerritoryClick(territory.id)}
                  >
                    <TableCell className="font-medium">{territory.number}</TableCell>
                    <TableCell>{getCurrentPublisher(territory)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(territory.status)}>
                        {territory.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{territory.territoryType}</TableCell>
                    <TableCell>{formatCheckoutDuration(territory)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditClick(e, territory)}
                          className="h-8 gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, territory)}
                          className="h-8 gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddTerritoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {selectedTerritory && (
        <EditTerritoryModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          territory={selectedTerritory}
        />
      )}

      <AlertDialog open={!!territoryToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Territory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this territory? This action cannot be undone.
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
