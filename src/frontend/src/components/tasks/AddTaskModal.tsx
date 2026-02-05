import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateTask } from '../../hooks/useCreateTask';
import { toast } from 'sonner';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CategoryOption = 'Territory' | 'Pioneers' | 'Meeting' | 'General' | 'Publisher' | 'Public Witnessing';

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<CategoryOption | ''>('');
  const [notes, setNotes] = useState('');

  const createTaskMutation = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    try {
      // Convert date string to seconds timestamp
      const dateObj = new Date(dueDate);
      const dueDateSeconds = BigInt(Math.floor(dateObj.getTime() / 1000));

      await createTaskMutation.mutateAsync({
        title: title.trim(),
        dueDate: dueDateSeconds,
        category,
        notes: notes.trim() || undefined,
      });

      toast.success('Task added successfully!', {
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
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setCategory('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const isPending = createTaskMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryOption)} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Territory">Territory</SelectItem>
                <SelectItem value="Pioneers">Pioneers</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Publisher">Publisher</SelectItem>
                <SelectItem value="Public Witnessing">Public Witnessing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes/Comments */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes/Comments</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes (optional)"
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {isPending ? 'Creating...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
