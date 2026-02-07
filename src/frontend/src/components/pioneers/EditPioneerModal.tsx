import { useState, useEffect } from 'react';
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
import { useUpdatePioneer } from '../../hooks/useUpdatePioneer';
import { toast } from 'sonner';
import type { Publisher, Pioneer } from '../../backend';

interface EditPioneerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pioneer: Pioneer | null;
  publishers: Publisher[];
  publishersLoading: boolean;
}

export default function EditPioneerModal({
  isOpen,
  onClose,
  pioneer,
  publishers,
  publishersLoading,
}: EditPioneerModalProps) {
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>('');
  const [serviceYear, setServiceYear] = useState<string>('');

  const updatePioneerMutation = useUpdatePioneer();

  // Filter active publishers and sort alphabetically by name
  const activePublishers = publishers
    .filter((p) => p.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Pre-fill form when pioneer changes
  useEffect(() => {
    if (pioneer) {
      setSelectedPublisherId(pioneer.publisherId);
      setServiceYear(pioneer.serviceYear);
    }
  }, [pioneer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pioneer) return;

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
      await updatePioneerMutation.mutateAsync({
        id: pioneer.id,
        input: {
          publisherId: selectedPublisherId,
          publisherName: selectedPublisher.fullName,
          serviceYear,
        },
      });

      // Success - show toast and close modal
      toast.success('Pioneer updated successfully!', {
        duration: 3000,
        style: {
          background: 'oklch(0.7 0.15 145)',
          color: 'white',
        },
      });

      onClose();
    } catch (error) {
      // Error - keep modal open, show error toast
      console.error('Failed to update pioneer:', error);
      toast.error('Failed to update pioneer. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pioneer</DialogTitle>
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
              disabled={updatePioneerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePioneerMutation.isPending || !selectedPublisherId || !serviceYear}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {updatePioneerMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
