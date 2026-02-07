import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreatePioneer } from '../../hooks/useCreatePioneer';
import { toast } from 'sonner';
import type { Publisher } from '../../backend';

interface AddPioneerModalProps {
  isOpen: boolean;
  onClose: () => void;
  publishers: Publisher[];
  publishersLoading: boolean;
}

export default function AddPioneerModal({
  isOpen,
  onClose,
  publishers,
  publishersLoading,
}: AddPioneerModalProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>('');
  const [serviceYear, setServiceYear] = useState<string>('');

  const createPioneerMutation = useCreatePioneer();

  // Filter active publishers and sort alphabetically by name
  const activePublishers = publishers
    .filter((p) => p.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedPublisherId || !serviceYear) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Find the selected publisher to get their name
    const selectedPublisher = activePublishers.find(
      (p) => p.id.toString() === selectedPublisherId
    );

    if (!selectedPublisher) {
      toast.error('Selected publisher not found');
      return;
    }

    try {
      await createPioneerMutation.mutateAsync({
        publisherId: selectedPublisherId,
        publisherName: selectedPublisher.fullName,
        serviceYear,
      });

      // Success - show toast and close modal
      toast.success('Pioneer added successfully!', {
        duration: 3000,
        style: {
          background: 'oklch(0.7 0.15 145)',
          color: 'white',
        },
      });

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      // Error - keep modal open, show error toast
      console.error('Failed to add pioneer:', error);
      toast.error('Failed to add pioneer. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedPublisherId('');
    setServiceYear('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Pioneer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Publisher */}
          <div className="space-y-2">
            <Label htmlFor="publisher">
              Publisher <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedPublisherId}
              onValueChange={setSelectedPublisherId}
              required
              disabled={publishersLoading}
            >
              <SelectTrigger id="publisher">
                <SelectValue placeholder="Select publisher" />
              </SelectTrigger>
              <SelectContent>
                {activePublishers.map((publisher) => (
                  <SelectItem key={publisher.id.toString()} value={publisher.id.toString()}>
                    {publisher.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Year */}
          <div className="space-y-2">
            <Label htmlFor="serviceYear">
              Service Year <span className="text-destructive">*</span>
            </Label>
            <Select value={serviceYear} onValueChange={setServiceYear} required>
              <SelectTrigger id="serviceYear">
                <SelectValue placeholder="Select service year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
                <SelectItem value="2026-2027">2026-2027</SelectItem>
                <SelectItem value="2027-2028">2027-2028</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createPioneerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPioneerMutation.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {createPioneerMutation.isPending ? 'Adding...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
