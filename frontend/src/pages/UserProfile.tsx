import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useCallerUserProfile';
import { toast } from 'sonner';
import { useRouterState } from '@tanstack/react-router';
import { getPageThemeColor } from '@/theme/pageTheme';

export default function UserProfile() {
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground mb-6">User Profile</h1>

      <div className="space-y-6 bg-card border rounded-lg p-6">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditingFullName}
              className="flex-1"
            />
            {!isEditingFullName ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditingFullName(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  onClick={handleSaveFullName}
                  disabled={saveProfileMutation.isPending}
                  style={{ backgroundColor: themeColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCancelFullName}
                  disabled={saveProfileMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Congregation Name Field */}
        <div className="space-y-2">
          <Label htmlFor="congregationName">Congregation Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="congregationName"
              type="text"
              value={congregationName}
              onChange={(e) => setCongregationName(e.target.value)}
              disabled={!isEditingCongregationName}
              className="flex-1"
            />
            {!isEditingCongregationName ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditingCongregationName(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  onClick={handleSaveCongregationName}
                  disabled={saveProfileMutation.isPending}
                  style={{ backgroundColor: themeColor, color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCancelCongregationName}
                  disabled={saveProfileMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
