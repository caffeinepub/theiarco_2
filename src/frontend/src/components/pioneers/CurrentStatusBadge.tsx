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
      <Badge variant="secondary" className="bg-gray-200 text-gray-600">
        Loading...
      </Badge>
    );
  }

  // No entries case
  if (monthlyHours.length === 0) {
    return (
      <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500 text-white">
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
      <Badge className="bg-green-600 hover:bg-green-700">
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
