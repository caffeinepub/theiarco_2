import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useCallerUserProfile';
import { toast } from 'sonner';

export default function UserProfile() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  // Local state for form fields
  const [fullName, setFullName] = useState('');
  const [congregationName, setCongregationName] = useState('');

  // Last saved values for cancel functionality
  const [lastSavedFullName, setLastSavedFullName] = useState('');
  const [lastSavedCongregationName, setLastSavedCongregationName] = useState('');

  // Edit mode state for each field
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [isEditingCongregationName, setIsEditingCongregationName] = useState(false);

  // Initialize form values when profile loads
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.name);
      setCongregationName(userProfile.congregationName);
      setLastSavedFullName(userProfile.name);
      setLastSavedCongregationName(userProfile.congregationName);
    }
  }, [userProfile]);

  const handleSaveFullName = async () => {
    try {
      await saveProfileMutation.mutateAsync({
        name: fullName,
        congregationName: congregationName,
      });
      setLastSavedFullName(fullName);
      setIsEditingFullName(false);
      toast.success('Full name updated successfully!', { duration: 3000 });
    } catch (error) {
      toast.error('Failed to update full name');
      console.error('Error saving full name:', error);
    }
  };

  const handleSaveCongregationName = async () => {
    try {
      await saveProfileMutation.mutateAsync({
        name: fullName,
        congregationName: congregationName,
      });
      setLastSavedCongregationName(congregationName);
      setIsEditingCongregationName(false);
      toast.success('Congregation name updated successfully!', { duration: 3000 });
    } catch (error) {
      toast.error('Failed to update congregation name');
      console.error('Error saving congregation name:', error);
    }
  };

  const handleCancelFullName = () => {
    setFullName(lastSavedFullName);
    setIsEditingFullName(false);
  };

  const handleCancelCongregationName = () => {
    setCongregationName(lastSavedCongregationName);
    setIsEditingCongregationName(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Personal Information Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditingFullName}
              className="flex-1"
            />
            {!isEditingFullName ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingFullName(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveFullName}
                  disabled={saveProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelFullName}
                  disabled={saveProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Congregation Name Field */}
        <div className="space-y-2">
          <Label htmlFor="congregationName">Congregation Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="congregationName"
              value={congregationName}
              onChange={(e) => setCongregationName(e.target.value)}
              disabled={!isEditingCongregationName}
              className="flex-1"
            />
            {!isEditingCongregationName ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingCongregationName(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveCongregationName}
                  disabled={saveProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCongregationName}
                  disabled={saveProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
