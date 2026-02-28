import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateGroupVisit } from '../../hooks/useCreateGroupVisit';
import { useUpdateGroupVisit } from '../../hooks/useUpdateGroupVisit';
import { toast } from 'sonner';
import type { Publisher, GroupVisit } from '../../backend';

interface RecordGroupVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupNumber: number;
  publishers: Publisher[];
  visitToEdit?: GroupVisit | null;
}

export default function RecordGroupVisitModal({ 
  open, 
  onOpenChange, 
  groupNumber,
  publishers,
  visitToEdit = null
}: RecordGroupVisitModalProps) {
  const [visitDate, setVisitDate] = useState('');
  const [discussionTopics, setDiscussionTopics] = useState('');
  const [selectedPublishers, setSelectedPublishers] = useState<Set<string>>(new Set());
  const [notesForOverseer, setNotesForOverseer] = useState('');
  const [notesForAssistant, setNotesForAssistant] = useState('');
  const [nextPlannedVisitDate, setNextPlannedVisitDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const createGroupVisit = useCreateGroupVisit();
  const updateGroupVisit = useUpdateGroupVisit();

  const isEditMode = !!visitToEdit;

  // Prefill form when editing
  useEffect(() => {
    if (open && visitToEdit) {
      // Convert timestamp to date string
      const visitDateObj = new Date(Number(visitToEdit.visitDate) * 1000);
      const visitDateStr = visitDateObj.toISOString().split('T')[0];
      setVisitDate(visitDateStr);

      setDiscussionTopics(visitToEdit.discussionTopics);
      setSelectedPublishers(new Set(visitToEdit.publishersPresent));
      setNotesForOverseer(visitToEdit.notesForOverseer);
      setNotesForAssistant(visitToEdit.notesForAssistant);

      if (visitToEdit.nextPlannedVisitDate) {
        const nextDateObj = new Date(Number(visitToEdit.nextPlannedVisitDate) * 1000);
        const nextDateStr = nextDateObj.toISOString().split('T')[0];
        setNextPlannedVisitDate(nextDateStr);
      } else {
        setNextPlannedVisitDate('');
      }
    }
  }, [open, visitToEdit]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setVisitDate('');
      setDiscussionTopics('');
      setSelectedPublishers(new Set());
      setNotesForOverseer('');
      setNotesForAssistant('');
      setNextPlannedVisitDate('');
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }
    if (!discussionTopics.trim()) {
      newErrors.discussionTopics = 'Discussion topics is required';
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

    // Convert date string to seconds timestamp
    const dateObj = new Date(visitDate);
    const visitDateSeconds = BigInt(Math.floor(dateObj.getTime() / 1000));

    // Convert next planned visit date to seconds timestamp if provided
    let nextPlannedVisitSeconds: bigint | null = null;
    if (nextPlannedVisitDate) {
      const nextDateObj = new Date(nextPlannedVisitDate);
      nextPlannedVisitSeconds = BigInt(Math.floor(nextDateObj.getTime() / 1000));
    }

    // Get publisher IDs and names
    const publisherIds = Array.from(selectedPublishers);
    const publisherNames = publisherIds.map((id) => {
      const publisher = publishers.find((p) => p.id.toString() === id);
      return publisher ? publisher.fullName : 'Unknown';
    });

    try {
      if (isEditMode && visitToEdit) {
        // Update existing visit
        await updateGroupVisit.mutateAsync({
          id: visitToEdit.id,
          groupNumber,
          visitDate: visitDateSeconds,
          discussionTopics: discussionTopics.trim(),
          publishersPresent: publisherIds,
          publisherNamesPresent: publisherNames,
          notesForOverseer: notesForOverseer.trim(),
          notesForAssistant: notesForAssistant.trim(),
          nextPlannedVisitDate: nextPlannedVisitSeconds,
        });

        toast.success('Group visit updated successfully', {
          duration: 3000,
          style: {
            backgroundColor: 'hsl(142.1 76.2% 36.3%)',
            color: 'white',
          },
        });
      } else {
        // Create new visit
        await createGroupVisit.mutateAsync({
          groupNumber,
          visitDate: visitDateSeconds,
          discussionTopics: discussionTopics.trim(),
          publishersPresent: publisherIds,
          publisherNamesPresent: publisherNames,
          notesForOverseer: notesForOverseer.trim(),
          notesForAssistant: notesForAssistant.trim(),
          nextPlannedVisitDate: nextPlannedVisitSeconds,
        });

        toast.success('Group visit saved successfully', {
          duration: 3000,
          style: {
            backgroundColor: 'hsl(142.1 76.2% 36.3%)',
            color: 'white',
          },
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving group visit:', error);
      toast.error('Failed to save group visit. Please try again.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const isPending = createGroupVisit.isPending || updateGroupVisit.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Group Visit' : 'Record Group Visit'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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

          {/* Discussion Topics */}
          <div className="space-y-2">
            <Label htmlFor="discussionTopics">
              Discussion Topics <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="discussionTopics"
              placeholder="What was discussed during the visit..."
              value={discussionTopics}
              onChange={(e) => setDiscussionTopics(e.target.value)}
              rows={4}
              className={`resize-none ${errors.discussionTopics ? 'border-destructive' : ''}`}
            />
            {errors.discussionTopics && (
              <p className="text-sm text-destructive">{errors.discussionTopics}</p>
            )}
          </div>

          {/* Publishers Present */}
          <div className="space-y-2">
            <Label>Publishers Present</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
              {publishers.length > 0 ? (
                publishers.map((publisher) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No publishers in this group</p>
              )}
            </div>
          </div>

          {/* Notes for Overseer */}
          <div className="space-y-2">
            <Label htmlFor="notesForOverseer">Notes for Overseer</Label>
            <Textarea
              id="notesForOverseer"
              placeholder="Notes for the group overseer..."
              value={notesForOverseer}
              onChange={(e) => setNotesForOverseer(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Notes for Assistant */}
          <div className="space-y-2">
            <Label htmlFor="notesForAssistant">Notes for Assistant</Label>
            <Textarea
              id="notesForAssistant"
              placeholder="Notes for the group assistant..."
              value={notesForAssistant}
              onChange={(e) => setNotesForAssistant(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Next Planned Visit Date */}
          <div className="space-y-2">
            <Label htmlFor="nextPlannedVisitDate">Next Planned Visit Date</Label>
            <Input
              id="nextPlannedVisitDate"
              type="date"
              value={nextPlannedVisitDate}
              onChange={(e) => setNextPlannedVisitDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            style={{ backgroundColor: '#43587A', color: 'white' }}
            className="hover:opacity-90"
          >
            {isPending ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
