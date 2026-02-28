import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { useUpdateCheckoutRecord } from '../../hooks/useUpdateCheckoutRecord';
import type { CheckoutRecord, PublisherId } from '../../backend';
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
import { normalizeTimestampToMs } from '@/utils/territoryTime';

interface EditCheckoutRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territoryId: string;
  record: CheckoutRecord;
}

// Helper to convert timestamp to YYYY-MM-DD string
function timestampToDateString(timestamp: bigint): string {
  const ms = normalizeTimestampToMs(timestamp);
  const date = new Date(ms);
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

  // Pre-fill form when modal opens or record changes
  useEffect(() => {
    if (open && record) {
      setSelectedPublisherId(record.publisherId.toString());
      setDateCheckedOut(timestampToDateString(record.dateCheckedOut));
      setDateReturned(record.dateReturned ? timestampToDateString(record.dateReturned) : '');
      setIsCampaign(record.isCampaign);
    }
  }, [open, record]);

  const handleSubmit = async () => {
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
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update checkout record:', error);
      toast.error('Failed to update checkout record. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Checkout Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher *</Label>
            {publishersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading publishers...
              </div>
            ) : (
              <Select
                value={selectedPublisherId}
                onValueChange={setSelectedPublisherId}
              >
                <SelectTrigger id="publisher">
                  <SelectValue placeholder="Select a publisher" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
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

          <div className="space-y-2">
            <Label htmlFor="dateCheckedOut">Date Checked Out *</Label>
            <Input
              id="dateCheckedOut"
              type="date"
              value={dateCheckedOut}
              onChange={(e) => setDateCheckedOut(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateReturned">Date Returned</Label>
            <Input
              id="dateReturned"
              type="date"
              value={dateReturned}
              onChange={(e) => setDateReturned(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCampaign"
              checked={isCampaign}
              onCheckedChange={(checked) => setIsCampaign(checked === true)}
            />
            <Label
              htmlFor="isCampaign"
              className="text-sm font-normal cursor-pointer"
            >
              This is a campaign
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
