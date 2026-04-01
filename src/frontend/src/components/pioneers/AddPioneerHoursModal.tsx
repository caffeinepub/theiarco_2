import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAddPioneerHours } from "../../hooks/usePioneerHours";

interface AddPioneerHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  pioneerId: string;
  serviceYear: string;
  month: string;
}

export default function AddPioneerHoursModal({
  isOpen,
  onClose,
  pioneerId,
  serviceYear,
  month,
}: AddPioneerHoursModalProps) {
  const [hours, setHours] = useState("");
  const addHoursMutation = useAddPioneerHours();

  useEffect(() => {
    if (!isOpen) {
      setHours("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = Number.parseInt(hours, 10);
    if (Number.isNaN(hoursNum) || hoursNum < 0) {
      return;
    }

    await addHoursMutation.mutateAsync({
      pioneerId,
      month,
      hours: BigInt(hoursNum),
      serviceYear,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Hours for {month}</DialogTitle>
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
              disabled={addHoursMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addHoursMutation.isPending}
              style={{ backgroundColor: "#43587A" }}
              className="text-white hover:opacity-90"
            >
              {addHoursMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Hours"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
