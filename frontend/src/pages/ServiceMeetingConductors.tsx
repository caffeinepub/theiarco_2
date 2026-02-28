import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from '@/components/ui/table';
import { useGetAllTrainedConductors } from '../hooks/useTrainedConductors';
import { formatTrainingDate } from '../utils/formatters';
import ConductorModal from '../components/conductors/ConductorModal';
import DeleteConductorDialog from '../components/conductors/DeleteConductorDialog';
import type { TrainedServiceMeetingConductor } from '../backend';
import { getPageThemeColor } from '@/theme/pageTheme';
import { getContrastColor } from '@/theme/colorUtils';
import { ThemedPrimaryButton } from '@/components/theming/ThemedPrimaryButton';
import { ThemedTableHeaderRow, ThemedTableHead } from '@/components/theming/ThemedTableHeaderRow';

export default function ServiceMeetingConductors() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
  const { data: conductors, isLoading } = useGetAllTrainedConductors();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConductor, setSelectedConductor] = useState<TrainedServiceMeetingConductor | null>(null);
  const [conductorToDelete, setConductorToDelete] = useState<string | null>(null);

  const handleAddConductor = () => {
    setSelectedConductor(null);
    setModalOpen(true);
  };

  const handleEditConductor = (e: React.MouseEvent, conductor: TrainedServiceMeetingConductor) => {
    e.stopPropagation();
    setSelectedConductor(conductor);
    setModalOpen(true);
  };

  const handleDeleteConductor = (e: React.MouseEvent, conductorId: string) => {
    e.stopPropagation();
    setConductorToDelete(conductorId);
    setDeleteDialogOpen(true);
  };

  const handleConductorClick = (conductorId: string) => {
    navigate({ to: `/conductors/${conductorId}` });
  };

  // Sort conductors alphabetically by name
  const sortedConductors = conductors
    ? [...conductors].sort((a, b) => a.publisherName.localeCompare(b.publisherName))
    : [];

  const headerTextColor = getContrastColor(themeColor);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Service Meeting Conductors</h1>
        <ThemedPrimaryButton
          themeColor={themeColor}
          onClick={handleAddConductor}
        >
          Add Conductor
        </ThemedPrimaryButton>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-theiarco-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedConductors.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No trained conductors found. Click 'Add Conductor' to add one.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && sortedConductors.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <ThemedTableHeaderRow themeColor={themeColor}>
                <ThemedTableHead themeColor={themeColor}>Conductor Name</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Training Date</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Status</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Available Days</ThemedTableHead>
                <ThemedTableHead themeColor={themeColor}>Actions</ThemedTableHead>
              </ThemedTableHeaderRow>
            </TableHeader>
            <TableBody>
              {sortedConductors.map((conductor) => {
                const availableDays: string[] = [];
                if (conductor.availableThursday) availableDays.push('Thu');
                if (conductor.availableFriday) availableDays.push('Fri');
                if (conductor.availableSaturday) availableDays.push('Sat');
                if (conductor.availableSunday) availableDays.push('Sun');

                return (
                  <tr 
                    key={conductor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleConductorClick(conductor.id)}
                  >
                    <TableCell className="font-medium">{conductor.publisherName}</TableCell>
                    <TableCell>{formatTrainingDate(conductor.trainingDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={conductor.status === 'Available' ? 'default' : 'destructive'}
                        className={
                          conductor.status === 'Available'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {conductor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {availableDays.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {availableDays.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditConductor(e, conductor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteConductor(e, conductor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modals */}
      <ConductorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        conductor={selectedConductor}
      />

      {conductorToDelete && (
        <DeleteConductorDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          conductorId={conductorToDelete}
        />
      )}
    </div>
  );
}
