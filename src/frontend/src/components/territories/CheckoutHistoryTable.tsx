import type { CheckoutRecord } from '../../backend';
import { formatCheckoutDate } from '../../utils/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CheckoutHistoryTableProps {
  checkOutHistory: CheckoutRecord[];
}

export function CheckoutHistoryTable({ checkOutHistory }: CheckoutHistoryTableProps) {
  // Sort by dateCheckedOut descending (most recent first)
  const sortedHistory = [...checkOutHistory].sort((a, b) => {
    return Number(b.dateCheckedOut - a.dateCheckedOut);
  });

  if (sortedHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No checkout history yet
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Publisher Name</TableHead>
            <TableHead>Date Checked Out</TableHead>
            <TableHead>Date Returned</TableHead>
            <TableHead>Campaign</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHistory.map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {record.publisherName}
              </TableCell>
              <TableCell>
                {formatCheckoutDate(record.dateCheckedOut)}
              </TableCell>
              <TableCell>
                {record.dateReturned !== undefined && record.dateReturned !== null
                  ? formatCheckoutDate(record.dateReturned)
                  : 'Still Out'}
              </TableCell>
              <TableCell>{record.isCampaign ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
