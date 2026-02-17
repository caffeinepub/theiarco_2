import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAddMeetingAttendance } from '../../hooks/useAddMeetingAttendance';
import { useUpdateMeetingAttendance } from '../../hooks/useUpdateMeetingAttendance';
import type { Publisher, MeetingAttendance } from '../../backend';

interface RecordAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupNumber: number;
  publishers: Publisher[];
  attendanceToEdit?: MeetingAttendance | null;
}

export default function RecordAttendanceModal({ 
  open, 
  onOpenChange, 
  groupNumber,
  publishers,
  attendanceToEdit
}: RecordAttendanceModalProps) {
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addMeetingAttendance = useAddMeetingAttendance();
  const updateMeetingAttendance = useUpdateMeetingAttendance();

  const isEditMode = !!attendanceToEdit;

  // Prefill form when editing
  useEffect(() => {
    if (open && attendanceToEdit) {
      // Convert bigint timestamp (seconds) to date string
      const dateMs = Number(attendanceToEdit.meetingDate) * 1000;
      const date = new Date(dateMs);
      const dateString = date.toISOString().split('T')[0];
      
      setMeetingDate(dateString);
      // Normalize legacy "Weekday Meeting" to "Mid-week Meeting"
      const normalizedType = attendanceToEdit.meetingType === 'Weekday Meeting' 
        ? 'Mid-week Meeting' 
        : attendanceToEdit.meetingType;
      setMeetingType(normalizedType);
      setSelectedPublishers(new Set(attendanceToEdit.publishersPresent));
    }
  }, [open, attendanceToEdit]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setMeetingDate('');
      setMeetingType('');
      setSelectedPublishers(new Set());
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!meetingDate) {
      newErrors.meetingDate = 'Meeting date is required';
    }
    if (!meetingType) {
      newErrors.meetingType = 'Meeting type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublisherToggle = (publisherId: string) => {
    const newSelected = new Set(selectedPublishers);
    if (newSelected.has(publisherId)) {
      newSelected.delete(publisherId);
    } else {
      newSelected.add(publisherId);
    }
    setSelectedPublishers(newSelected);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Get publisher names for selected publishers
    const publisherIds = Array.from(selectedPublishers);
    const publisherNames = publisherIds
      .map(id => {
        const publisher = publishers.find(p => p.id.toString() === id);
        return publisher?.fullName || '';
      })
      .filter(name => name !== '');

    try {
      if (isEditMode && attendanceToEdit) {
        await updateMeetingAttendance.mutateAsync({
          id: attendanceToEdit.id,
          meetingDate: new Date(meetingDate),
          meetingType,
          publishersPresent: publisherIds,
          publisherNamesPresent: publisherNames,
        });
      } else {
        await addMeetingAttendance.mutateAsync({
          groupNumber,
          meetingDate: new Date(meetingDate),
          meetingType,
          publishersPresent: publisherIds,
          publisherNamesPresent: publisherNames,
        });
      }

      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Error submitting attendance:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isPending = addMeetingAttendance.isPending || updateMeetingAttendance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit' : 'Record'} Attendance - Group {groupNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Meeting Date */}
          <div className="space-y-2">
            <Label htmlFor="meetingDate">
              Meeting Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meetingDate"
              type="date"
              value={meetingDate}
              onChange={(e) => {
                setMeetingDate(e.target.value);
                if (errors.meetingDate) {
                  setErrors({ ...errors, meetingDate: '' });
                }
              }}
              className={errors.meetingDate ? 'border-destructive' : ''}
            />
            {errors.meetingDate && (
              <p className="text-sm text-destructive">{errors.meetingDate}</p>
            )}
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label htmlFor="meetingType">
              Meeting Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={meetingType}
              onValueChange={(value) => {
                setMeetingType(value);
                if (errors.meetingType) {
                  setErrors({ ...errors, meetingType: '' });
                }
              }}
            >
              <SelectTrigger 
                id="meetingType"
                className={errors.meetingType ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mid-week Meeting">Mid-week Meeting</SelectItem>
                <SelectItem value="Weekend Meeting">Weekend Meeting</SelectItem>
              </SelectContent>
            </Select>
            {errors.meetingType && (
              <p className="text-sm text-destructive">{errors.meetingType}</p>
            )}
          </div>

          {/* Publishers Present */}
          <div className="space-y-2">
            <Label>Publishers Present</Label>
            {publishers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No publishers in this group</p>
            ) : (
              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                {publishers.map((publisher) => (
                  <div key={publisher.id.toString()} className="flex items-center space-x-2">
                    <Checkbox
                      id={`publisher-${publisher.id}`}
                      checked={selectedPublishers.has(publisher.id.toString())}
                      onCheckedChange={() => handlePublisherToggle(publisher.id.toString())}
                    />
                    <label
                      htmlFor={`publisher-${publisher.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {publisher.fullName}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
