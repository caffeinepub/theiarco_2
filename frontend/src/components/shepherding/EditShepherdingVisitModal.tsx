import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateShepherdingVisit } from '../../hooks/useShepherdingVisit';
import { toast } from 'sonner';
import type { ShepherdingVisit, Publisher } from '../../backend';

interface EditShepherdingVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: ShepherdingVisit;
  publishers: Publisher[];
}

export function EditShepherdingVisitModal({ open, onOpenChange, visit, publishers }: EditShepherdingVisitModalProps) {
  const [publisherId, setPublisherId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [eldersPresent, setEldersPresent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateVisit = useUpdateShepherdingVisit();

  // Initialize form with visit data when modal opens
  useEffect(() => {
    if (open && visit) {
      setPublisherId(visit.publisherId);
      
      // Convert timestamp to date string (YYYY-MM-DD)
      const dateObj = new Date(Number(visit.visitDate) * 1000);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setVisitDate(`${year}-${month}-${day}`);
      
      setEldersPresent(visit.eldersPresent);
      setErrors({});
    }
  }, [open, visit]);

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
      await updateVisit.mutateAsync({
        id: visit.id,
        publisherId: publisherId,
        publisherName: selectedPublisher.fullName,
        visitDate: visitDateSeconds,
        eldersPresent: eldersPresent.trim(),
        notes: visit.notes, // Keep existing notes
      });

      toast.success('Visit updated successfully!', {
        duration: 3000,
        style: {
          backgroundColor: 'hsl(142.1 76.2% 36.3%)',
          color: 'white',
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating visit:', error);
      toast.error('Failed to update visit. Please try again.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Shepherding Visit</DialogTitle>
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
              <SelectContent>
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
          <Button variant="outline" onClick={handleCancel} disabled={updateVisit.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateVisit.isPending}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {updateVisit.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
