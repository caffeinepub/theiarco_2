import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateShepherdingVisit } from '../../hooks/useCreateShepherdingVisit';
import { toast } from 'sonner';
import type { Publisher } from '../../backend';

interface RecordVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishers: Publisher[];
}

export default function RecordVisitModal({ open, onOpenChange, publishers }: RecordVisitModalProps) {
  const [publisherId, setPublisherId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [eldersPresent, setEldersPresent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const createVisit = useCreateShepherdingVisit();

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setPublisherId('');
      setVisitDate('');
      setEldersPresent('');
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!publisherId) {
      newErrors.publisherId = 'Publisher is required';
    }
    if (!visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }
    if (!eldersPresent.trim()) {
      newErrors.eldersPresent = 'Elders present is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedPublisher = publishers.find((p) => p.id.toString() === publisherId);
    if (!selectedPublisher) {
      toast.error('Selected publisher not found');
      return;
    }

    // Convert date string to seconds timestamp
    const dateObj = new Date(visitDate);
    const visitDateSeconds = BigInt(Math.floor(dateObj.getTime() / 1000));

    try {
      await createVisit.mutateAsync({
        publisherId: publisherId,
        publisherName: selectedPublisher.fullName,
        visitDate: visitDateSeconds,
        eldersPresent: eldersPresent.trim(),
        notes: '', // Always empty string as per requirements
      });

      toast.success('Visit recorded successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating visit:', error);
      toast.error('Failed to record visit. Please try again.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Shepherding Visit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Publisher Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="publisher">
              Publisher <span className="text-destructive">*</span>
            </Label>
            <Select value={publisherId} onValueChange={setPublisherId}>
              <SelectTrigger id="publisher" className={errors.publisherId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a publisher" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {publishers.map((publisher) => (
                  <SelectItem key={publisher.id.toString()} value={publisher.id.toString()}>
                    {publisher.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.publisherId && (
              <p className="text-sm text-destructive">{errors.publisherId}</p>
            )}
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="visitDate">
              Visit Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="visitDate"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className={errors.visitDate ? 'border-destructive' : ''}
            />
            {errors.visitDate && (
              <p className="text-sm text-destructive">{errors.visitDate}</p>
            )}
          </div>

          {/* Elders Present */}
          <div className="space-y-2">
            <Label htmlFor="eldersPresent">
              Elders Present <span className="text-destructive">*</span>
            </Label>
            <Input
              id="eldersPresent"
              type="text"
              placeholder="e.g., Sunny Trevino, Miguel Guerrero"
              value={eldersPresent}
              onChange={(e) => setEldersPresent(e.target.value)}
              className={errors.eldersPresent ? 'border-destructive' : ''}
            />
            {errors.eldersPresent && (
              <p className="text-sm text-destructive">{errors.eldersPresent}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={createVisit.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createVisit.isPending}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {createVisit.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
