import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2, Check, X } from 'lucide-react';
import { useGetPioneer } from '../hooks/usePioneers';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useGetPioneerHoursForServiceYear, useUpdatePioneerHours } from '../hooks/usePioneerHours';
import EditPioneerModal from '../components/pioneers/EditPioneerModal';
import DeletePioneerDialog from '../components/pioneers/DeletePioneerDialog';
import AddPioneerHoursModal from '../components/pioneers/AddPioneerHoursModal';
import DeletePioneerHoursDialog from '../components/pioneers/DeletePioneerHoursDialog';
import PioneerSummaryStatsCard from '../components/pioneers/PioneerSummaryStatsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PioneerMonthlyHours } from '../backend';

export default function PioneerProfile() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddHoursModalOpen, setIsAddHoursModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isDeleteHoursDialogOpen, setIsDeleteHoursDialogOpen] = useState(false);
  const [selectedHoursRecord, setSelectedHoursRecord] = useState<PioneerMonthlyHours | null>(null);
  
  // Inline editing state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingHoursValue, setEditingHoursValue] = useState('');

  const { data: pioneer, isLoading } = useGetPioneer(id || '');
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const { data: monthlyHours = [], isLoading: hoursLoading } = useGetPioneerHoursForServiceYear(
    id || '',
    pioneer?.serviceYear || ''
  );
  const updateHoursMutation = useUpdatePioneerHours();

  const handleBackClick = () => {
    navigate({ to: '/pioneers' });
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    navigate({ to: '/pioneers' });
  };

  const handleAddHoursClick = (month: string) => {
    setSelectedMonth(month);
    setIsAddHoursModalOpen(true);
  };

  const handleInlineEditClick = (hoursRecord: PioneerMonthlyHours) => {
    setEditingRecordId(hoursRecord.id);
    setEditingHoursValue(hoursRecord.hours.toString());
  };

  const handleCancelInlineEdit = () => {
    setEditingRecordId(null);
    setEditingHoursValue('');
  };

  const handleSaveInlineEdit = async (hoursRecord: PioneerMonthlyHours) => {
    const newHours = parseInt(editingHoursValue, 10);
    if (isNaN(newHours) || newHours < 0) {
      return;
    }

    await updateHoursMutation.mutateAsync({
      id: hoursRecord.id,
      pioneerId: hoursRecord.pioneerId,
      month: hoursRecord.month,
      hours: BigInt(newHours),
      serviceYear: hoursRecord.serviceYear,
    });

    setEditingRecordId(null);
    setEditingHoursValue('');
  };

  const handleDeleteHoursClick = (hoursRecord: PioneerMonthlyHours) => {
    setSelectedHoursRecord(hoursRecord);
    setIsDeleteHoursDialogOpen(true);
  };

  // Service year months in order
  const serviceYearMonths = [
    'September',
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
  ];

  // Create a map of month -> hours record
  const hoursMap = new Map<string, PioneerMonthlyHours>();
  monthlyHours.forEach((record) => {
    hoursMap.set(record.month, record);
  });

  // Calculate statistics
  const totalHours = monthlyHours.reduce((sum, record) => sum + Number(record.hours), 0);
  const monthsWithHours = monthlyHours.length;
  const average = monthsWithHours > 0 ? totalHours / monthsWithHours : 0;

  // Determine status
  let status: 'loading' | 'no-entries' | 'on-track' | 'behind' = 'loading';
  if (!hoursLoading) {
    if (monthsWithHours === 0) {
      status = 'no-entries';
    } else if (average >= 50) {
      status = 'on-track';
    } else {
      status = 'behind';
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading pioneer...</span>
        </div>
      </div>
    );
  }

  if (!pioneer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Pioneer not found</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pioneers
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
          Back to Pioneers
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {pioneer.publisherName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {pioneer.serviceYear}
            </p>
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

      {/* Summary Statistics Card */}
      <PioneerSummaryStatsCard
        totalHours={totalHours}
        average={average}
        status={status}
      />

      {/* Monthly Hours Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Monthly Hours</h2>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceYearMonths.map((month) => {
                const hoursRecord = hoursMap.get(month);
                const isEditing = hoursRecord && editingRecordId === hoursRecord.id;
                const hours = hoursRecord ? Number(hoursRecord.hours) : null;
                
                // Determine color class for hours
                let hoursColorClass = 'text-muted-foreground';
                if (hours !== null) {
                  hoursColorClass = hours >= 50 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
                }

                return (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{month}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingHoursValue}
                          onChange={(e) => setEditingHoursValue(e.target.value)}
                          className="w-24"
                          min="0"
                          autoFocus
                        />
                      ) : (
                        <span className={hoursColorClass}>
                          {hoursRecord ? hoursRecord.hours.toString() : '—'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveInlineEdit(hoursRecord!)}
                            disabled={updateHoursMutation.isPending}
                          >
                            {updateHoursMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelInlineEdit}
                            disabled={updateHoursMutation.isPending}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : hoursRecord ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInlineEditClick(hoursRecord)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteHoursClick(hoursRecord)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddHoursClick(month)}
                        >
                          Add Hours
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPioneerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        pioneer={pioneer}
        publishers={publishers}
        publishersLoading={publishersLoading}
      />

      {/* Delete Dialog */}
      <DeletePioneerDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        pioneer={pioneer}
        onDeleted={handleDeleteSuccess}
      />

      {/* Add Hours Modal */}
      {isAddHoursModalOpen && (
        <AddPioneerHoursModal
          isOpen={isAddHoursModalOpen}
          onClose={() => setIsAddHoursModalOpen(false)}
          pioneerId={pioneer.id}
          serviceYear={pioneer.serviceYear}
          month={selectedMonth}
        />
      )}

      {/* Delete Hours Dialog */}
      {isDeleteHoursDialogOpen && selectedHoursRecord && (
        <DeletePioneerHoursDialog
          isOpen={isDeleteHoursDialogOpen}
          onClose={() => setIsDeleteHoursDialogOpen(false)}
          hoursRecord={selectedHoursRecord}
        />
      )}
    </div>
  );
}
