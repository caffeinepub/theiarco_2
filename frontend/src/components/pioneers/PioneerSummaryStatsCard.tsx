import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PioneerSummaryStatsCardProps {
  totalHours: number;
  average: number;
  status: 'loading' | 'no-entries' | 'on-track' | 'behind';
}

export default function PioneerSummaryStatsCard({
  totalHours,
  average,
  status,
}: PioneerSummaryStatsCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return (
          <Badge variant="secondary" className="bg-gray-200 text-gray-600">
            Loading...
          </Badge>
        );
      case 'no-entries':
        return (
          <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500 text-white">
            No Entries
          </Badge>
        );
      case 'on-track':
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            On Track
          </Badge>
        );
      case 'behind':
        return (
          <Badge variant="destructive">
            Behind
          </Badge>
        );
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Hours */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
            <p className="text-3xl font-bold text-foreground">{totalHours}</p>
          </div>

          {/* Service Year Average */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Service Year Average</p>
            <p className="text-3xl font-bold text-foreground">
              {status === 'no-entries' ? '—' : `${average.toFixed(1)} hours`}
            </p>
          </div>

          {/* Current Status */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Current Status</p>
            <div className="pt-1">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
