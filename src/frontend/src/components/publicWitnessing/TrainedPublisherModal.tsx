import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { useCreateTrainedPublisher } from '../../hooks/useCreateTrainedPublisher';
import { useUpdateTrainedPublisher } from '../../hooks/useUpdateTrainedPublisher';
import type { TrainedPublisher } from '../../backend';

interface TrainedPublisherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  publisher?: TrainedPublisher;
}

export default function TrainedPublisherModal({
  open,
  onOpenChange,
  mode,
  publisher,
}: TrainedPublisherModalProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { data: publishers = [] } = useGetAllPublishers();
  const createMutation = useCreateTrainedPublisher();
  const updateMutation = useUpdateTrainedPublisher();

  // Filter active publishers and sort alphabetically
  const activePublishers = publishers
    .filter((p) => p.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === 'edit' && publisher) {
      setSelectedPublisherId(publisher.publisherId);
      // Convert seconds timestamp to date string
      const date = new Date(Number(publisher.trainingDate) * 1000);
      setTrainingDate(date.toISOString().split('T')[0]);
      setIsAuthorized(publisher.isAuthorized);
    } else {
      setSelectedPublisherId('');
      setTrainingDate('');
      setIsAuthorized(false);
    }
  }, [mode, publisher, open]);

  const handleSave = async () => {
    if (!selectedPublisherId || !trainingDate) {
      return;
    }

    const selectedPublisher = publishers.find((p) => p.id.toString() === selectedPublisherId);
    if (!selectedPublisher) return;

    // Convert date to seconds timestamp
    const dateObj = new Date(trainingDate);
    const trainingDateSeconds = BigInt(Math.floor(dateObj.getTime() / 1000));

    if (mode === 'create') {
      await createMutation.mutateAsync({
        publisherId: selectedPublisherId,
        publisherName: selectedPublisher.fullName,
        trainingDate: trainingDateSeconds,
      });
    } else if (mode === 'edit' && publisher) {
      await updateMutation.mutateAsync({
        id: publisher.id,
        input: {
          publisherId: selectedPublisherId,
          publisherName: selectedPublisher.fullName,
          trainingDate: trainingDateSeconds,
          isAuthorized,
        },
      });
    }

    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Trained Publisher' : 'Edit Trained Publisher'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Publisher Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Select value={selectedPublisherId} onValueChange={setSelectedPublisherId}>
              <SelectTrigger id="publisher">
                <SelectValue placeholder="Select a publisher" />
              </SelectTrigger>
              <SelectContent>
                {activePublishers.map((p) => (
                  <SelectItem key={p.id.toString()} value={p.id.toString()}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Training Date */}
          <div className="space-y-2">
            <Label htmlFor="trainingDate">Training Date</Label>
            <input
              id="trainingDate"
              type="date"
              value={trainingDate}
              onChange={(e) => setTrainingDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Authorized Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="authorized"
              checked={isAuthorized}
              onCheckedChange={(checked) => setIsAuthorized(checked === true)}
            />
            <Label htmlFor="authorized" className="cursor-pointer">
              Authorized by Body of Elders
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedPublisherId || !trainingDate || isLoading}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
