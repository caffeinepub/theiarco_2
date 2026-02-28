import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatNoteDate } from '../../utils/formatters';
import type { GlobalNote } from '../../backend';

interface GlobalNoteCardProps {
  note: GlobalNote;
  attachedPublisherName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryColors: Record<string, string> = {
  Publishers: 'bg-blue-500 text-white hover:bg-blue-600',
  Territory: 'bg-green-500 text-white hover:bg-green-600',
  Shepherding: 'bg-purple-500 text-white hover:bg-purple-600',
  Elder: 'bg-orange-500 text-white hover:bg-orange-600',
  General: 'bg-gray-500 text-white hover:bg-gray-600',
};

export default function GlobalNoteCard({
  note,
  attachedPublisherName,
  onEdit,
  onDelete,
}: GlobalNoteCardProps) {
  const contentPreview =
    note.content.length > 200
      ? note.content.substring(0, 200) + '...'
      : note.content;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Title */}
      <h3 className="text-xl font-bold text-foreground">{note.title}</h3>

      {/* Category Badge and Attachment */}
      <div className="flex flex-wrap items-center gap-2">
        {note.category !== 'None' && (
          <Badge className={categoryColors[note.category] || 'bg-gray-500'}>
            {note.category}
          </Badge>
        )}
        {attachedPublisherName && (
          <span className="text-sm text-muted-foreground">
            📎 Attached to: {attachedPublisherName}
          </span>
        )}
      </div>

      {/* Content Preview */}
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {contentPreview}
      </p>

      {/* Footer: Date and Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-xs text-muted-foreground">
          {formatNoteDate(note.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
