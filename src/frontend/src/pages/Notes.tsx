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

const categories = [
  'All Notes',
  'Publishers',
  'Territory',
  'Shepherding',
  'Elder',
  'General',
  'Uncategorized'
] as const;

export default function Notes() {
  const [activeCategory, setActiveCategory] = useState<string>('All Notes');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<GlobalNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<GlobalNote | null>(null);

  const { data: notes = [], isLoading } = useGetAllGlobalNotes();
  const { data: publishers = [] } = useGetAllPublishers();
  const deleteNoteMutation = useDeleteGlobalNote();

  // Filter notes by active category
  const filteredNotes = useMemo(() => {
    if (activeCategory === 'All Notes') {
      return notes;
    }
    if (activeCategory === 'Uncategorized') {
      return notes.filter((note) => note.category === 'None');
    }
    return notes.filter((note) => note.category === activeCategory);
  }, [notes, activeCategory]);

  // Sort notes by creation date (most recent first)
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      return Number(b.createdAt - a.createdAt);
    });
  }, [filteredNotes]);

  // Helper to get publisher name by ID
  const getPublisherName = (publisherId?: bigint): string | undefined => {
    if (!publisherId) return undefined;
    const publisher = publishers.find((p) => p.id === publisherId);
    return publisher?.fullName;
  };

  const handleEditClick = (note: GlobalNote) => {
    setNoteToEdit(note);
    setIsAddNoteModalOpen(true);
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

  const handleModalClose = () => {
    setIsAddNoteModalOpen(false);
    setNoteToEdit(null);
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notes</h1>
      </div>

      {/* Add Note Button */}
      <div>
        <Button
          style={{ backgroundColor: '#43587A' }}
          className="text-white hover:opacity-90 transition-opacity"
          onClick={() => setIsAddNoteModalOpen(true)}
        >
          Add Note
        </Button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            style={
              activeCategory === category
                ? { backgroundColor: '#43587A', color: 'white' }
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

      {/* Notes Display Area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">
              No notes in this category. Click 'Add Note' to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map((note) => (
              <GlobalNoteCard
                key={note.id.toString()}
                note={note}
                attachedPublisherName={getPublisherName(note.attachedPublisher)}
                onEdit={() => handleEditClick(note)}
                onDelete={() => handleDeleteClick(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <AddGlobalNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={handleModalClose}
        noteToEdit={noteToEdit}
      />

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
