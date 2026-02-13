import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useUpdatePioneerHours } from '../../hooks/usePioneerHours';
import { Loader2 } from 'lucide-react';
import type { PioneerMonthlyHours } from '../../backend';

interface EditPioneerHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  hoursRecord: PioneerMonthlyHours;
}

export default function EditPioneerHoursModal({
  isOpen,
  onClose,
  hoursRecord,
}: EditPioneerHoursModalProps) {
  const [hours, setHours] = useState('');
  const updateHoursMutation = useUpdatePioneerHours();

  useEffect(() => {
    if (isOpen && hoursRecord) {
      setHours(hoursRecord.hours.toString());
    }
  }, [isOpen, hoursRecord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = parseInt(hours, 10);
    if (isNaN(hoursNum) || hoursNum < 0) {
      return;
    }

    await updateHoursMutation.mutateAsync({
      id: hoursRecord.id,
      pioneerId: hoursRecord.pioneerId,
      month: hoursRecord.month,
      hours: BigInt(hoursNum),
      serviceYear: hoursRecord.serviceYear,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Hours for {hoursRecord.month}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Enter hours"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateHoursMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateHoursMutation.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {updateHoursMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
