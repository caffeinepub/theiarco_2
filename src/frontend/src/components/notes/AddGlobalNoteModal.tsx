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
import { useCreateGlobalNote } from '../../hooks/useCreateGlobalNote';
import { useUpdateGlobalNote } from '../../hooks/useUpdateGlobalNote';
import { useGetAllPublishers } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { PublisherId, GlobalNote } from '../../backend';

interface AddGlobalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: GlobalNote | null;
}

type CategoryOption = 'None' | 'Publishers' | 'Territory' | 'Shepherding' | 'Elder' | 'General';

export default function AddGlobalNoteModal({ isOpen, onClose, noteToEdit }: AddGlobalNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryOption | ''>('');
  const [attachedPublisher, setAttachedPublisher] = useState<string>('');

  const createNoteMutation = useCreateGlobalNote();
  const updateNoteMutation = useUpdateGlobalNote();
  const { data: publishers = [] } = useGetAllPublishers();

  const isEditMode = !!noteToEdit;

  // Filter to only active publishers
  const activePublishers = publishers.filter((p) => p.isActive);

  // Initialize form with note data when editing
  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setCategory(noteToEdit.category as CategoryOption);
      setAttachedPublisher(noteToEdit.attachedPublisher?.toString() || '');
    } else {
      resetForm();
    }
  }, [noteToEdit]);

  // Reset attached publisher when category changes
  useEffect(() => {
    if (category !== 'Publishers') {
      setAttachedPublisher('');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim() || !content.trim() || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditMode && noteToEdit) {
        // Update existing note
        await updateNoteMutation.mutateAsync({
          id: noteToEdit.id,
          title: title.trim(),
          content: content.trim(),
          category,
          attachedPublisher: attachedPublisher ? BigInt(attachedPublisher) : undefined,
        });

        toast.success('Note updated successfully!', {
          duration: 3000,
          style: {
            background: 'oklch(0.7 0.15 145)',
            color: 'white',
          },
        });
      } else {
        // Create new note
        await createNoteMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          category,
          attachedPublisher: attachedPublisher ? BigInt(attachedPublisher) : undefined,
        });

        toast.success('Note created successfully!', {
          duration: 3000,
          style: {
            background: 'oklch(0.7 0.15 145)',
            color: 'white',
          },
        });
      }

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      // Error - keep modal open, show error toast
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} note:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} note. Please try again.`);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setAttachedPublisher('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Determine if "Attach To" field should be shown
  const showAttachTo = category === 'Publishers' || category === 'Territory' || category === 'Shepherding';

  // Determine if "Attach To" field should be disabled
  const isAttachToDisabled = category === 'Territory' || category === 'Shepherding';

  // Get placeholder text for disabled states
  const getAttachToPlaceholder = () => {
    if (category === 'Territory') return 'Territories (coming soon)';
    if (category === 'Shepherding') return 'Shepherding Visits (coming soon)';
    if (category === 'Publishers') return 'Select publisher';
    return '';
  };

  const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Note' : 'Add Note'}</DialogTitle>
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
              placeholder="Enter note title"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              rows={6}
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
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Publishers">Publishers</SelectItem>
                <SelectItem value="Territory">Territory</SelectItem>
                <SelectItem value="Shepherding">Shepherding</SelectItem>
                <SelectItem value="Elder">Elder</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attach To (conditional) */}
          {showAttachTo && (
            <div className="space-y-2">
              <Label htmlFor="attachTo">Attach To</Label>
              <Select
                value={attachedPublisher}
                onValueChange={setAttachedPublisher}
                disabled={isAttachToDisabled}
              >
                <SelectTrigger id="attachTo">
                  <SelectValue placeholder={getAttachToPlaceholder()} />
                </SelectTrigger>
                <SelectContent>
                  {category === 'Publishers' &&
                    activePublishers.map((publisher) => (
                      <SelectItem key={publisher.id.toString()} value={publisher.id.toString()}>
                        {publisher.fullName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              {isPending ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save' : 'Submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
