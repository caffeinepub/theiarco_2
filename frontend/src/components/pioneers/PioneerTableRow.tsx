import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useGetPioneerHoursForServiceYear } from '../../hooks/usePioneerHours';
import CurrentStatusBadge from './CurrentStatusBadge';
import type { Pioneer } from '../../backend';

interface PioneerTableRowProps {
  pioneer: Pioneer;
  onPioneerClick: (pioneerId: string) => void;
  onEdit: (pioneer: Pioneer) => void;
  onDelete: (pioneer: Pioneer) => void;
}

export default function PioneerTableRow({
  pioneer,
  onPioneerClick,
  onEdit,
  onDelete,
}: PioneerTableRowProps) {
  const { data: monthlyHours = [], isLoading } = useGetPioneerHoursForServiceYear(
    pioneer.id,
    pioneer.serviceYear
  );

  // Calculate total hours
  const totalHours = monthlyHours.reduce((sum, record) => sum + Number(record.hours), 0);

  // Calculate average hours
  const averageHours = monthlyHours.length > 0 ? totalHours / monthlyHours.length : 0;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <button
          className="text-primary hover:underline cursor-pointer"
          onClick={() => onPioneerClick(pioneer.id)}
        >
          {pioneer.publisherName}
        </button>
      </TableCell>
      <TableCell>{pioneer.serviceYear}</TableCell>
      <TableCell>
        {isLoading ? (
          <span className="text-muted-foreground">—</span>
        ) : monthlyHours.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span>{totalHours}</span>
        )}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <span className="text-muted-foreground">—</span>
        ) : monthlyHours.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span>{averageHours.toFixed(1)}</span>
        )}
      </TableCell>
      <TableCell>
        <CurrentStatusBadge pioneerId={pioneer.id} serviceYear={pioneer.serviceYear} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button variant="outline" size="sm" onClick={() => onEdit(pioneer)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(pioneer)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
