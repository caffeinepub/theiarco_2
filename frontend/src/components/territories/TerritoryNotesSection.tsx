import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TerritoryNoteCard } from './TerritoryNoteCard';
import { EditTerritoryNoteModal } from './EditTerritoryNoteModal';
import { DeleteTerritoryNoteDialog } from './DeleteTerritoryNoteDialog';
import {
  useGetAllTerritoryNotes,
  useCreateTerritoryNote,
} from '../../hooks/useTerritoryNotes';
import type { TerritoryNote } from '../../backend';
import { toast } from 'sonner';

interface TerritoryNotesSectionProps {
  territoryId: string;
}

export function TerritoryNotesSection({ territoryId }: TerritoryNotesSectionProps) {
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<TerritoryNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<TerritoryNote | null>(null);

  const { data: notes = [], isLoading } = useGetAllTerritoryNotes(territoryId);
  const createNote = useCreateTerritoryNote(territoryId);

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await createNote.mutateAsync({
        title: '',
        content: noteContent.trim(),
      });

      toast.success('Notes saved successfully!', {
        duration: 3000,
        className: 'bg-green-600 text-white',
      });

      setNoteContent('');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    return Number(b.createdAt - a.createdAt);
  });

  return (
    <div className="rounded-lg border bg-card p-6 mt-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>

      {/* Composer */}
      <div className="mb-6">
        <Textarea
          placeholder="Add a note about this territory..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          className="mb-3 min-h-[100px]"
        />
        <Button
          onClick={handleSaveNote}
          disabled={!noteContent.trim() || createNote.isPending}
          style={{ backgroundColor: '#43587A', color: 'white' }}
          className="hover:opacity-90"
        >
          {createNote.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Notes'
          )}
        </Button>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading notes...</span>
        </div>
      ) : sortedNotes.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No notes yet. Add your first note above.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <TerritoryNoteCard
              key={note.id.toString()}
              note={note}
              onEdit={() => setEditingNote(note)}
              onDelete={() => setDeletingNote(note)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <EditTerritoryNoteModal
          open={!!editingNote}
          onOpenChange={(open) => !open && setEditingNote(null)}
          note={editingNote}
          territoryId={territoryId}
        />
      )}

      {/* Delete Dialog */}
      {deletingNote && (
        <DeleteTerritoryNoteDialog
          open={!!deletingNote}
          onOpenChange={(open) => !open && setDeletingNote(null)}
          note={deletingNote}
          territoryId={territoryId}
        />
      )}
    </div>
  );
}
