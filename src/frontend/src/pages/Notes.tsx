import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AddGlobalNoteModal from '@/components/notes/AddGlobalNoteModal';
import GlobalNoteCard from '@/components/notes/GlobalNoteCard';
import { useGetAllGlobalNotes } from '../hooks/useGlobalNotes';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useDeleteGlobalNote } from '../hooks/useDeleteGlobalNote';
import { toast } from 'sonner';
import type { GlobalNote } from '../backend';
import { useRouterState } from '@tanstack/react-router';
import { getPageThemeColor } from '@/theme/pageTheme';
import { getContrastColor } from '@/theme/colorUtils';
import { ThemedPrimaryButton } from '@/components/theming/ThemedPrimaryButton';

type CategoryFilter = 'All' | 'General' | 'Publishers' | 'Territories' | 'Service' | 'Other';

export default function Notes() {
  const routerState = useRouterState();
  const themeColor = getPageThemeColor(routerState.location.pathname);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<GlobalNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<GlobalNote | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const { data: notes = [], isLoading } = useGetAllGlobalNotes();
  const { data: publishers = [] } = useGetAllPublishers();
  const deleteNoteMutation = useDeleteGlobalNote();

  // Filter notes by category
  const filteredNotes = useMemo(() => {
    if (activeCategory === 'All') return notes;
    return notes.filter((note) => note.category === activeCategory);
  }, [notes, activeCategory]);

  // Sort notes by date (newest first)
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  }, [filteredNotes]);

  const handleEditClick = (note: GlobalNote) => {
    setEditingNote(note);
  };

  const handleDeleteClick = (note: GlobalNote) => {
    setNoteToDelete(note);
  };

  const handleDeleteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNoteMutation.mutateAsync(noteToDelete.id);
      toast.success('Note deleted successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note. Please try again.');
    } finally {
      setNoteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setNoteToDelete(null);
  };

  // Helper to get publisher name by ID
  const getPublisherName = (publisherId: bigint | undefined): string | undefined => {
    if (!publisherId) return undefined;
    const publisher = publishers.find((p) => p.id === publisherId);
    return publisher?.fullName;
  };

  const categories: CategoryFilter[] = ['All', 'General', 'Publishers', 'Territories', 'Service', 'Other'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notes</h1>
        <ThemedPrimaryButton
          themeColor={themeColor}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Note
        </ThemedPrimaryButton>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            style={
              activeCategory === category
                ? { backgroundColor: themeColor, color: getContrastColor(themeColor) }
                : undefined
            }
            className={
              activeCategory === category
                ? 'hover:opacity-90 transition-opacity'
                : 'hover:bg-accent'
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedNotes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {notes.length === 0
            ? "No notes found. Click 'Add Note' to create your first note."
            : `No notes in the ${activeCategory} category.`}
        </div>
      )}

      {/* Notes Grid */}
      {!isLoading && sortedNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => (
            <GlobalNoteCard
              key={note.id}
              note={note}
              attachedPublisherName={getPublisherName(note.attachedPublisher)}
              onEdit={() => handleEditClick(note)}
              onDelete={() => handleDeleteClick(note)}
            />
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <AddGlobalNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Note Modal */}
      {editingNote && (
        <AddGlobalNoteModal
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          noteToEdit={editingNote}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
