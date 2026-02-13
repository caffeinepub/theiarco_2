import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { useGetAllTerritories } from '../hooks/useTerritories';
import { useGetAllPublishers } from '../hooks/useQueries';
import { AddTerritoryModal } from '../components/territories/AddTerritoryModal';
import { exportTerritoryAssignmentRecord } from '../utils/territoryAssignmentRecordCsvExport';
import type { Territory, CheckoutRecord } from '../backend';

type SortColumn = 'number' | 'publisher' | 'status' | 'type' | 'duration' | null;
type SortDirection = 'default' | 'asc' | 'desc';

export default function Territories() {
  const { data: territories, isLoading } = useGetAllTerritories();
  const { data: publishers } = useGetAllPublishers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'text-green-600';
      case 'Checked Out':
        return 'text-blue-600';
      case 'Under Review':
        return 'text-orange-600';
      default:
        return 'text-foreground';
    }
  };

  const handleTerritoryClick = (territoryId: string) => {
    navigate({ to: '/territories/$id', params: { id: territoryId } });
  };

  const handleExportCsv = () => {
    if (territories && territories.length > 0) {
      exportTerritoryAssignmentRecord(territories);
    }
  };

  // Helper to get the most recent checkout record (largest dateCheckedOut)
  const getMostRecentCheckoutRecord = (territory: Territory): CheckoutRecord | null => {
    if (!territory.checkOutHistory || territory.checkOutHistory.length === 0) {
      return null;
    }

    // Return the record with the largest dateCheckedOut
    return territory.checkOutHistory.reduce((latest, current) => {
      return Number(current.dateCheckedOut) > Number(latest.dateCheckedOut) ? current : latest;
    });
  };

  // Helper to get the active checkout record (most recent with dateReturned = null)
  const getActiveCheckoutRecord = (territory: Territory): CheckoutRecord | null => {
    const activeRecords = territory.checkOutHistory.filter(
      (record) => record.dateReturned === undefined || record.dateReturned === null
    );

    if (activeRecords.length === 0) return null;

    // Return the record with the largest dateCheckedOut
    return activeRecords.reduce((latest, current) => {
      return Number(current.dateCheckedOut) > Number(latest.dateCheckedOut) ? current : latest;
    });
  };

  // Helper to get publisher name for display
  const getPublisherName = (territory: Territory): string => {
    if (territory.status === 'Available') {
      return '—';
    }

    if (territory.status === 'Checked Out') {
      const mostRecentRecord = getMostRecentCheckoutRecord(territory);
      
      if (!mostRecentRecord) {
        return '—';
      }

      // Use the publisher name from the checkout record
      if (mostRecentRecord.publisherName) {
        return mostRecentRecord.publisherName;
      }

      // Fallback: try to look up publisher by ID if name is missing
      if (publishers && mostRecentRecord.publisherId !== undefined) {
        const publisher = publishers.find(p => Number(p.id) === Number(mostRecentRecord.publisherId));
        if (publisher) {
          return publisher.fullName;
        }
      }

      return '—';
    }

    // For "Under Review" or other statuses, show em dash
    return '—';
  };

  // Helper to calculate checked out duration in months
  const getCheckedOutDuration = (territory: Territory): { months: number; display: string } | null => {
    if (territory.status !== 'Checked Out') {
      return null;
    }

    const activeRecord = getActiveCheckoutRecord(territory);
    if (!activeRecord) {
      return null;
    }

    const currentTimestampSeconds = Math.floor(Date.now() / 1000);
    const dateCheckedOutSeconds = Number(activeRecord.dateCheckedOut);
    const months = Math.floor((currentTimestampSeconds - dateCheckedOutSeconds) / (30 * 24 * 60 * 60));

    return {
      months,
      display: `${months} months`,
    };
  };

  // Helper to determine if row should have red background
  const shouldHighlightRow = (territory: Territory): boolean => {
    if (territory.status !== 'Checked Out') {
      return false;
    }

    const duration = getCheckedOutDuration(territory);
    return duration !== null && duration.months >= 4;
  };

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
          // Try numeric comparison first
          const aNum = parseFloat(a.number);
          const bNum = parseFloat(b.number);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            comparison = aNum - bNum;
          } else {
            comparison = a.number.localeCompare(b.number);
          }
          break;
        }

        case 'publisher': {
          const aName = getPublisherName(a);
          const bName = getPublisherName(b);
          // Sort em-dash consistently (put at end)
          if (aName === '—' && bName !== '—') return 1;
          if (aName !== '—' && bName === '—') return -1;
          comparison = aName.localeCompare(bName);
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
          const aDuration = getCheckedOutDuration(a);
          const bDuration = getCheckedOutDuration(b);
          const aMonths = aDuration?.months ?? -1;
          const bMonths = bDuration?.months ?? -1;
          // Sort missing duration (em-dash) consistently (put at end)
          if (aMonths === -1 && bMonths !== -1) return 1;
          if (aMonths !== -1 && bMonths === -1) return -1;
          comparison = aMonths - bMonths;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [territories, sortColumn, sortDirection, publishers]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Territories</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            disabled={!territories || territories.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Territory History
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            Add Territory
          </Button>
        </div>
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
      {!isLoading && territories && territories.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No territories added. Click 'Add Territory' to create one.
          </p>
        </div>
      )}

      {/* Territories Table */}
      {!isLoading && territories && territories.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('number')}
                    className="cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors w-full text-left font-medium"
                  >
                    Territory Number{getSortIndicator('number')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('publisher')}
                    className="cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors w-full text-left font-medium"
                  >
                    Publisher{getSortIndicator('publisher')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('status')}
                    className="cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors w-full text-left font-medium"
                  >
                    Status{getSortIndicator('status')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('type')}
                    className="cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors w-full text-left font-medium"
                  >
                    Type{getSortIndicator('type')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('duration')}
                    className="cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 -my-1 rounded transition-colors w-full text-left font-medium"
                  >
                    Checked Out Duration{getSortIndicator('duration')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTerritories.map((territory) => {
                const duration = getCheckedOutDuration(territory);
                const highlight = shouldHighlightRow(territory);
                const publisherName = getPublisherName(territory);
                const isAvailable = territory.status === 'Available';

                return (
                  <TableRow key={territory.id} className={highlight ? 'bg-red-100' : ''}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleTerritoryClick(territory.id)}
                        className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        {territory.number}
                      </button>
                    </TableCell>
                    <TableCell className={isAvailable ? 'text-muted-foreground' : ''}>
                      {publisherName}
                    </TableCell>
                    <TableCell className={getStatusColor(territory.status)}>
                      {territory.status}
                    </TableCell>
                    <TableCell>{territory.territoryType}</TableCell>
                    <TableCell>
                      {duration ? duration.display : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Territory Modal */}
      <AddTerritoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
