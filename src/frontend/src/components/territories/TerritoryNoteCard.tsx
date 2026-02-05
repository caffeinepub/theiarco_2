import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TerritoryNote } from '../../backend';
import { formatNoteDate } from '../../utils/formatters';

interface TerritoryNoteCardProps {
  note: TerritoryNote;
  onEdit: () => void;
  onDelete: () => void;
}

export function TerritoryNoteCard({ note, onEdit, onDelete }: TerritoryNoteCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {note.content}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatNoteDate(note.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
