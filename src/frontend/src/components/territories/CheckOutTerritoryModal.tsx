import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { useCheckOutTerritory } from '../../hooks/useCheckOutTerritory';
import type { PublisherId } from '../../backend';
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

interface CheckOutTerritoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territoryId: string;
}

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to convert YYYY-MM-DD string to seconds timestamp
function dateStringToSeconds(dateString: string): bigint {
  const date = new Date(dateString + 'T00:00:00');
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function CheckOutTerritoryModal({
  open,
  onOpenChange,
  territoryId,
}: CheckOutTerritoryModalProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>('');
  const [dateCheckedOut, setDateCheckedOut] = useState<string>('');
  const [isCampaign, setIsCampaign] = useState(false);

  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const checkOutMutation = useCheckOutTerritory();

  // Filter active publishers and sort alphabetically by fullName
  const activePublishers = publishers
    .filter((p) => p.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Reset form and set date to today when modal opens
  useEffect(() => {
    if (open) {
      setSelectedPublisherId('');
      setDateCheckedOut(getTodayDateString());
      setIsCampaign(false);
    }
  }, [open]);

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
      await checkOutMutation.mutateAsync({
        territoryId,
        publisherId: BigInt(selectedPublisherId),
        isCampaign,
        dateCheckedOut: dateStringToSeconds(dateCheckedOut),
      });

      toast.success('Territory checked out successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      // Close modal (form reset handled by useEffect)
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to check out territory:', error);
      toast.error('Failed to check out territory');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check Out Territory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assigned To Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="publisher">Assigned To</Label>
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

          {/* Date Checked Out */}
          <div className="space-y-2">
            <Label htmlFor="dateCheckedOut">Date Checked Out</Label>
            <Input
              id="dateCheckedOut"
              type="date"
              value={dateCheckedOut}
              onChange={(e) => setDateCheckedOut(e.target.value)}
              required
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
            disabled={checkOutMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPublisherId || !dateCheckedOut || checkOutMutation.isPending}
            className="gap-2"
          >
            {checkOutMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
