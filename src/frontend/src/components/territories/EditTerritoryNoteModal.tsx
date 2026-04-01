import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TerritoryNote } from "../../backend";
import { useUpdateTerritoryNote } from "../../hooks/useTerritoryNotes";

interface EditTerritoryNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: TerritoryNote;
  territoryId: string;
}

export function EditTerritoryNoteModal({
  open,
  onOpenChange,
  note,
  territoryId,
}: EditTerritoryNoteModalProps) {
  const [content, setContent] = useState(note.content);
  const updateNote = useUpdateTerritoryNote(territoryId);

  useEffect(() => {
    if (open) {
      setContent(note.content);
    }
  }, [open, note.content]);

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      await updateNote.mutateAsync({
        noteId: note.id,
        input: {
          title: "",
          content: content.trim(),
        },
      });

      toast.success("Note updated successfully!", {
        duration: 3000,
        className: "bg-green-600 text-white",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
            placeholder="Edit your note..."
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateNote.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || updateNote.isPending}
            style={{ backgroundColor: "#43587A", color: "white" }}
            className="hover:opacity-90"
          >
            {updateNote.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
