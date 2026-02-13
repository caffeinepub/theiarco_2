import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { useCreateTrainedPublisher } from '../../hooks/useCreateTrainedPublisher';
import { useUpdateTrainedPublisher } from '../../hooks/useUpdateTrainedPublisher';
import type { TrainedPublisher } from '../../backend';
import { Loader2 } from 'lucide-react';

interface TrainedPublisherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publisher?: TrainedPublisher | null;
}

export default function TrainedPublisherModal({
  open,
  onOpenChange,
  publisher,
}: TrainedPublisherModalProps) {
  const isEditMode = !!publisher;
  const { data: publishers, isLoading: publishersLoading } = useGetAllPublishers();
  const createMutation = useCreateTrainedPublisher();
  const updateMutation = useUpdateTrainedPublisher();

  const [publisherId, setPublisherId] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasS148Received, setHasS148Received] = useState(false);

  // Pre-fill form in edit mode and reset in create mode
  useEffect(() => {
    if (publisher) {
      setPublisherId(publisher.publisherId);
      // Convert seconds timestamp to YYYY-MM-DD format
      const date = new Date(Number(publisher.trainingDate) * 1000);
      setTrainingDate(date.toISOString().split('T')[0]);
      setIsAuthorized(publisher.isAuthorized);
      setHasS148Received(publisher.hasS148Received);
    } else {
      // Reset form in create mode
      setPublisherId('');
      setTrainingDate('');
      setIsAuthorized(false);
      setHasS148Received(false);
    }
  }, [publisher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publisherId || !trainingDate) {
      return;
    }

    const selectedPublisher = publishers?.find((p) => p.id.toString() === publisherId);
    if (!selectedPublisher) return;

    // Convert date string to seconds timestamp
    const dateObj = new Date(trainingDate);
    const timestampSeconds = BigInt(Math.floor(dateObj.getTime() / 1000));

    if (isEditMode) {
      await updateMutation.mutateAsync({
        id: publisher.id,
        input: {
          publisherId,
          publisherName: selectedPublisher.fullName,
          trainingDate: timestampSeconds,
          isAuthorized,
          hasS148Received,
        },
      });
    } else {
      await createMutation.mutateAsync({
        publisherId,
        publisherName: selectedPublisher.fullName,
        trainingDate: timestampSeconds,
        hasS148Received,
      });
    }

    onOpenChange(false);
  };

  const activePublishers = publishers?.filter((p) => p.isActive) || [];
  const sortedPublishers = [...activePublishers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Trained Publisher' : 'Add Trained Publisher'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Publisher Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            {publishersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={publisherId} onValueChange={setPublisherId} required>
                <SelectTrigger id="publisher">
                  <SelectValue placeholder="Select a publisher" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {sortedPublishers.map((pub) => (
                    <SelectItem key={pub.id.toString()} value={pub.id.toString()}>
                      {pub.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Training Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="trainingDate">Training Date</Label>
            <input
              id="trainingDate"
              type="date"
              value={trainingDate}
              onChange={(e) => setTrainingDate(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Authorized Checkbox (only in edit mode) */}
          {isEditMode && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="authorized"
                checked={isAuthorized}
                onCheckedChange={(checked) => setIsAuthorized(checked === true)}
              />
              <label
                htmlFor="authorized"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Authorized by Body of Elders
              </label>
            </div>
          )}

          {/* S-148 Form Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasS148"
              checked={hasS148Received}
              onCheckedChange={(checked) => setHasS148Received(checked === true)}
            />
            <label
              htmlFor="hasS148"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Has received form S-148
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
