import { useState, useEffect } from 'react';
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
import { useUpdateTerritory } from '../../hooks/useTerritory';
import { toast } from 'sonner';
import type { Territory } from '../../backend';

interface EditTerritoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  territory: Territory;
}

export function EditTerritoryModal({ open, onOpenChange, territory }: EditTerritoryModalProps) {
  const [number, setNumber] = useState('');
  const [territoryType, setTerritoryType] = useState('');
  const [errors, setErrors] = useState<{ number?: string; territoryType?: string }>({});

  const updateTerritory = useUpdateTerritory();

  // Pre-fill form when modal opens or territory changes
  useEffect(() => {
    if (open && territory) {
      setNumber(territory.number);
      setTerritoryType(territory.territoryType);
      setErrors({});
    }
  }, [open, territory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { number?: string; territoryType?: string } = {};
    if (!number.trim()) {
      newErrors.number = 'Territory Number is required';
    }
    if (!territoryType) {
      newErrors.territoryType = 'Territory Type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateTerritory.mutateAsync({
        id: territory.id,
        number,
        territoryType,
      });

      toast.success('Territory updated successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update territory:', error);
      toast.error('Failed to update territory');
    }
  };

  const handleCancel = () => {
    setNumber(territory.number);
    setTerritoryType(territory.territoryType);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Territory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Territory Number */}
            <div className="space-y-2">
              <Label htmlFor="number">
                Territory Number <span className="text-destructive">*</span>
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

            {/* Status (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={territory.status}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Status is managed through the checkout/return workflow
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateTerritory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTerritory.isPending}
              style={{ backgroundColor: '#43587A', color: 'white' }}
              className="hover:opacity-90"
            >
              {updateTerritory.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
