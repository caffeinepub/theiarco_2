import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { useUpdateCheckoutRecord } from '../../hooks/useUpdateCheckoutRecord';
import type { CheckoutRecord } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface EditCheckoutRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territoryId: string;
  record: CheckoutRecord | null;
  onSuccess: () => void;
}

// Helper to convert bigint timestamp to YYYY-MM-DD string
function timestampToDateString(timestamp: bigint): string {
  // Detect if timestamp is in nanoseconds or seconds
  const timestampNum = Number(timestamp);
  let milliseconds: number;
  
  // If timestamp is very large, it's likely in nanoseconds
  if (timestampNum > 1_000_000_000_000) {
    milliseconds = Number(timestamp / BigInt(1_000_000));
  } else {
    // Otherwise it's in seconds
    milliseconds = timestampNum * 1000;
  }
  
  const date = new Date(milliseconds);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to convert YYYY-MM-DD string to seconds timestamp
function dateStringToSeconds(dateString: string): bigint {
  const date = new Date(dateString + 'T00:00:00');
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function EditCheckoutRecordModal({
  open,
  onOpenChange,
  territoryId,
  record,
  onSuccess,
}: EditCheckoutRecordModalProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>('');
  const [dateCheckedOut, setDateCheckedOut] = useState<string>('');
  const [dateReturned, setDateReturned] = useState<string>('');
  const [isCampaign, setIsCampaign] = useState(false);

  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const updateMutation = useUpdateCheckoutRecord();

  // Filter active publishers and sort alphabetically by fullName
  const activePublishers = publishers
    .filter((p) => p.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Pre-fill form when record changes
  useEffect(() => {
    if (record) {
      setSelectedPublisherId(record.publisherId.toString());
      setDateCheckedOut(timestampToDateString(record.dateCheckedOut));
      setDateReturned(
        record.dateReturned !== undefined && record.dateReturned !== null
          ? timestampToDateString(record.dateReturned)
          : ''
      );
      setIsCampaign(record.isCampaign);
    }
  }, [record]);

  const handleSubmit = async () => {
    if (!record) return;
    
    if (!selectedPublisherId) {
      toast.error('Please select a publisher');
      return;
    }

    if (!dateCheckedOut) {
      toast.error('Please select a checkout date');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        territoryId,
        originalPublisherId: record.publisherId,
        originalDateCheckedOut: record.dateCheckedOut,
        newPublisherId: BigInt(selectedPublisherId),
        newDateCheckedOut: dateStringToSeconds(dateCheckedOut),
        newDateReturned: dateReturned ? dateStringToSeconds(dateReturned) : null,
        newIsCampaign: isCampaign,
      });

      toast.success('Checkout record updated successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update checkout record:', error);
      toast.error('Failed to update checkout record');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Checkout Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Publisher Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            {publishersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedPublisherId}
                onValueChange={setSelectedPublisherId}
              >
                <SelectTrigger id="publisher">
                  <SelectValue placeholder="Select a publisher" />
                </SelectTrigger>
                <SelectContent>
                  {activePublishers.map((publisher) => (
                    <SelectItem
                      key={publisher.id.toString()}
                      value={publisher.id.toString()}
                    >
                      {publisher.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Checked Out */}
          <div className="space-y-2">
            <Label htmlFor="dateCheckedOut">Date Checked Out</Label>
            <Input
              id="dateCheckedOut"
              type="date"
              value={dateCheckedOut}
              onChange={(e) => setDateCheckedOut(e.target.value)}
            />
          </div>

          {/* Date Returned */}
          <div className="space-y-2">
            <Label htmlFor="dateReturned">Date Returned</Label>
            <Input
              id="dateReturned"
              type="date"
              value={dateReturned}
              onChange={(e) => setDateReturned(e.target.value)}
              placeholder="Leave empty if still out"
            />
          </div>

          {/* Campaign Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="campaign"
              checked={isCampaign}
              onCheckedChange={(checked) => setIsCampaign(checked === true)}
            />
            <Label
              htmlFor="campaign"
              className="text-sm font-normal cursor-pointer"
            >
              This is a campaign assignment
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPublisherId || !dateCheckedOut || updateMutation.isPending}
            className="gap-2"
          >
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
