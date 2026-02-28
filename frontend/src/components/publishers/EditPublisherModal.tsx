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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useUpdatePublisher } from '../../hooks/useUpdatePublisher';
import { toast } from 'sonner';
import type { Publisher } from '../../backend';

interface EditPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisher: Publisher;
}

type PrivilegeOption = 'Unbaptized Publisher' | 'Publisher' | 'Ministerial Servant' | 'Elder';

// Map backend privileges to UI privilege option
function mapPrivilegesToUI(privileges: {
  publisher: boolean;
  servant: boolean;
  elder: boolean;
}): PrivilegeOption {
  if (privileges.elder) return 'Elder';
  if (privileges.servant) return 'Ministerial Servant';
  if (privileges.publisher) return 'Publisher';
  return 'Unbaptized Publisher';
}

export default function EditPublisherModal({ isOpen, onClose, publisher }: EditPublisherModalProps) {
  const [fullName, setFullName] = useState('');
  const [fieldServiceGroup, setFieldServiceGroup] = useState<string>('');
  const [privileges, setPrivileges] = useState<PrivilegeOption | ''>('');
  const [isGroupOverseer, setIsGroupOverseer] = useState(false);
  const [isGroupAssistant, setIsGroupAssistant] = useState(false);
  const [markAsInactive, setMarkAsInactive] = useState(false);

  const updatePublisherMutation = useUpdatePublisher();

  // Initialize form with publisher data whenever publisher changes
  useEffect(() => {
    if (publisher) {
      setFullName(publisher.fullName);
      setFieldServiceGroup(publisher.fieldServiceGroup.toString());
      setPrivileges(mapPrivilegesToUI(publisher.privileges));
      setIsGroupOverseer(publisher.isGroupOverseer);
      setIsGroupAssistant(publisher.isGroupAssistant);
      setMarkAsInactive(!publisher.isActive);
    }
  }, [publisher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!fullName.trim() || !fieldServiceGroup || !privileges) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updatePublisherMutation.mutateAsync({
        id: publisher.id,
        fullName: fullName.trim(),
        fieldServiceGroup: Number(fieldServiceGroup),
        privileges,
        isGroupOverseer,
        isGroupAssistant,
        isActive: !markAsInactive,
      });

      // Success - show toast and close modal
      toast.success('Publisher updated successfully!', {
        duration: 3000,
        style: {
          background: 'oklch(0.7 0.15 145)',
          color: 'white',
        },
      });

      onClose();
    } catch (error) {
      // Error - keep modal open, show error toast
      console.error('Failed to update publisher:', error);
      toast.error('Failed to update publisher. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Publisher</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Field Service Group */}
          <div className="space-y-2">
            <Label htmlFor="fieldServiceGroup">
              Field Service Group <span className="text-destructive">*</span>
            </Label>
            <Select value={fieldServiceGroup} onValueChange={setFieldServiceGroup} required>
              <SelectTrigger id="fieldServiceGroup">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Privileges */}
          <div className="space-y-2">
            <Label htmlFor="privileges">
              Privileges <span className="text-destructive">*</span>
            </Label>
            <Select value={privileges} onValueChange={(value) => setPrivileges(value as PrivilegeOption)} required>
              <SelectTrigger id="privileges">
                <SelectValue placeholder="Select privileges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unbaptized Publisher">Unbaptized Publisher</SelectItem>
                <SelectItem value="Publisher">Publisher</SelectItem>
                <SelectItem value="Ministerial Servant">Ministerial Servant</SelectItem>
                <SelectItem value="Elder">Elder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="groupOverseer"
                checked={isGroupOverseer}
                onCheckedChange={(checked) => setIsGroupOverseer(checked === true)}
              />
              <Label htmlFor="groupOverseer" className="font-normal cursor-pointer">
                Group Overseer
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="groupAssistant"
                checked={isGroupAssistant}
                onCheckedChange={(checked) => setIsGroupAssistant(checked === true)}
              />
              <Label htmlFor="groupAssistant" className="font-normal cursor-pointer">
                Group Assistant
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="markAsInactive"
                checked={markAsInactive}
                onCheckedChange={(checked) => setMarkAsInactive(checked === true)}
              />
              <Label htmlFor="markAsInactive" className="font-normal cursor-pointer">
                Mark as Inactive
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatePublisherMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updatePublisherMutation.isPending}
              style={{ backgroundColor: '#43587A' }}
              className="text-white hover:opacity-90"
            >
              {updatePublisherMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
