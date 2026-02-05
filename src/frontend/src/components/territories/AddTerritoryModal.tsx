import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTerritory } from '../../hooks/useCreateTerritory';
import { toast } from 'sonner';

interface AddTerritoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTerritoryModal({ open, onOpenChange }: AddTerritoryModalProps) {
  const [number, setNumber] = useState('');
  const [territoryType, setTerritoryType] = useState('');
  const [errors, setErrors] = useState<{ number?: string; territoryType?: string }>({});

  const createTerritory = useCreateTerritory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { number?: string; territoryType?: string } = {};
    if (!number.trim()) {
      newErrors.number = 'Territory Number/Name is required';
    }
    if (!territoryType) {
      newErrors.territoryType = 'Territory Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createTerritory.mutateAsync({
        number,
        territoryType,
      });

      toast.success('Territory added successfully!', {
        duration: 3000,
      });

      // Reset form and close modal
      setNumber('');
      setTerritoryType('');
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create territory:', error);
      toast.error('Failed to add territory');
    }
  };

  const handleCancel = () => {
    setNumber('');
    setTerritoryType('');
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Territory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Territory Number/Name */}
            <div className="space-y-2">
              <Label htmlFor="number">
                Territory Number/Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  if (errors.number) {
                    setErrors({ ...errors, number: undefined });
                  }
                }}
                placeholder="e.g., 15, 4C-1, BZN-8"
              />
              {errors.number && (
                <p className="text-sm text-destructive">{errors.number}</p>
              )}
            </div>

            {/* Territory Type */}
            <div className="space-y-2">
              <Label htmlFor="territoryType">
                Territory Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={territoryType}
                onValueChange={(value) => {
                  setTerritoryType(value);
                  if (errors.territoryType) {
                    setErrors({ ...errors, territoryType: undefined });
                  }
                }}
              >
                <SelectTrigger id="territoryType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                  <SelectItem value="Letter Writing">Letter Writing</SelectItem>
                </SelectContent>
              </Select>
              {errors.territoryType && (
                <p className="text-sm text-destructive">{errors.territoryType}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createTerritory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTerritory.isPending}
              style={{ backgroundColor: '#43587A', color: 'white' }}
              className="hover:opacity-90"
            >
              {createTerritory.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
