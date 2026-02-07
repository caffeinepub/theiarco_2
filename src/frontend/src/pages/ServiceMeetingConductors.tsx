import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllServiceMeetingConductors } from '../hooks/useServiceMeetingConductors';
import { formatWeekOfDate } from '../utils/formatters';

export default function ServiceMeetingConductors() {
  const { data: conductors, isLoading } = useGetAllServiceMeetingConductors();

  const handleAssignConductor = () => {
    // Placeholder - modal will be implemented in next prompt
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Service Meeting Conductors</h1>
        <Button
          onClick={handleAssignConductor}
          style={{ backgroundColor: '#43587A' }}
          className="text-white hover:opacity-90"
        >
          Assign Conductor
        </Button>
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
      {!isLoading && conductors && conductors.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No conductors assigned. Click 'Assign Conductor' to create one.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && conductors && conductors.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week Of</TableHead>
                <TableHead>Conductor Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conductors.map((conductor) => (
                <TableRow key={conductor.id}>
                  <TableCell>{formatWeekOfDate(conductor.weekOf)}</TableCell>
                  <TableCell>{conductor.conductorName}</TableCell>
                  <TableCell>
                    {/* Placeholder for actions */}
                    <span className="text-muted-foreground text-sm">—</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
