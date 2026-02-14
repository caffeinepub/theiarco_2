import { Badge } from '@/components/ui/badge';
import { useGetPioneerHoursForServiceYear } from '../../hooks/usePioneerHours';

interface CurrentStatusBadgeProps {
  pioneerId: string;
  serviceYear: string;
}

export default function CurrentStatusBadge({ pioneerId, serviceYear }: CurrentStatusBadgeProps) {
  const { data: monthlyHours = [], isLoading } = useGetPioneerHoursForServiceYear(pioneerId, serviceYear);

  if (isLoading) {
    return (
      <Badge variant="secondary" className="bg-status-neutral text-status-neutral-foreground">
        Loading...
      </Badge>
    );
  }

  // No entries case
  if (monthlyHours.length === 0) {
    return (
      <Badge variant="secondary" className="bg-status-neutral text-status-neutral-foreground hover:bg-status-neutral/90">
        No Entries
      </Badge>
    );
  }

  // Calculate average
  const totalHours = monthlyHours.reduce((sum, record) => sum + Number(record.hours), 0);
  const average = totalHours / monthlyHours.length;

  // On Track (average >= 50)
  if (average >= 50) {
    return (
      <Badge className="bg-status-success text-status-success-foreground hover:bg-status-success/90">
        On Track
      </Badge>
    );
  }

  // Behind (average < 50)
  return (
    <Badge variant="destructive">
      Behind
    </Badge>
  );
}
