import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllTerritories } from '../hooks/useTerritories';
import { AddTerritoryModal } from '../components/territories/AddTerritoryModal';
import type { Territory, CheckoutRecord } from '../backend';

export default function Territories() {
  const { data: territories, isLoading } = useGetAllTerritories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Territories</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          style={{ backgroundColor: '#43587A', color: 'white' }}
          className="hover:opacity-90"
        >
          Add Territory
        </Button>
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
                <TableHead>Territory Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checked Out Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {territories.map((territory) => {
                const duration = getCheckedOutDuration(territory);
                const highlight = shouldHighlightRow(territory);

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
                    <TableCell>{territory.territoryType}</TableCell>
                    <TableCell className={getStatusColor(territory.status)}>
                      {territory.status}
                    </TableCell>
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
