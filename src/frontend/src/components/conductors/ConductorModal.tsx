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
import { useCreateTrainedConductor } from '../../hooks/useCreateTrainedConductor';
import { useUpdateTrainedConductor } from '../../hooks/useUpdateTrainedConductor';
import type { TrainedServiceMeetingConductor } from '../../backend';
import { Loader2 } from 'lucide-react';

interface ConductorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor?: TrainedServiceMeetingConductor | null;
}

export default function ConductorModal({
  open,
  onOpenChange,
  conductor,
}: ConductorModalProps) {
  const isEditMode = !!conductor;
  const { data: publishers, isLoading: publishersLoading } = useGetAllPublishers();
  const createMutation = useCreateTrainedConductor();
  const updateMutation = useUpdateTrainedConductor();

  const [publisherId, setPublisherId] = useState('');
  const [trainingDate, setTrainingDate] = useState('');
  const [status, setStatus] = useState<'Available' | 'Unavailable'>('Available');
  const [availableThursday, setAvailableThursday] = useState(false);
  const [availableFriday, setAvailableFriday] = useState(false);
  const [availableSaturday, setAvailableSaturday] = useState(false);
  const [availableSunday, setAvailableSunday] = useState(false);

  // Pre-fill form in edit mode and reset in create mode
  useEffect(() => {
    if (conductor) {
      setPublisherId(conductor.publisherId);
      // Convert seconds timestamp to YYYY-MM-DD format
      const date = new Date(Number(conductor.trainingDate) * 1000);
      setTrainingDate(date.toISOString().split('T')[0]);
      setStatus(conductor.status as 'Available' | 'Unavailable');
      setAvailableThursday(conductor.availableThursday || false);
      setAvailableFriday(conductor.availableFriday || false);
      setAvailableSaturday(conductor.availableSaturday || false);
      setAvailableSunday(conductor.availableSunday || false);
    } else {
      // Reset form in create mode
      setPublisherId('');
      setTrainingDate('');
      setStatus('Available');
      setAvailableThursday(false);
      setAvailableFriday(false);
      setAvailableSaturday(false);
      setAvailableSunday(false);
    }
  }, [conductor, open]);

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

    const input = {
      publisherId,
      publisherName: selectedPublisher.fullName,
      trainingDate: timestampSeconds,
      status,
      availableThursday,
      availableFriday,
      availableSaturday,
      availableSunday,
    };

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: conductor.id, input });
    } else {
      await createMutation.mutateAsync(input);
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
          <DialogTitle>{isEditMode ? 'Edit Conductor' : 'Add Conductor'}</DialogTitle>
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
                  {sortedPublishers.map((publisher) => (
                    <SelectItem key={publisher.id.toString()} value={publisher.id.toString()}>
                      {publisher.fullName}
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

          {/* Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as 'Available' | 'Unavailable')} required>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability Section */}
          <div className="space-y-3">
            <Label>Availability</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="thursday"
                  checked={availableThursday}
                  onCheckedChange={(checked) => setAvailableThursday(checked === true)}
                />
                <label
                  htmlFor="thursday"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Thursday
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="friday"
                  checked={availableFriday}
                  onCheckedChange={(checked) => setAvailableFriday(checked === true)}
                />
                <label
                  htmlFor="friday"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Friday
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saturday"
                  checked={availableSaturday}
                  onCheckedChange={(checked) => setAvailableSaturday(checked === true)}
                />
                <label
                  htmlFor="saturday"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Saturday
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sunday"
                  checked={availableSunday}
                  onCheckedChange={(checked) => setAvailableSunday(checked === true)}
                />
                <label
                  htmlFor="sunday"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sunday
                </label>
              </div>
            </div>
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
