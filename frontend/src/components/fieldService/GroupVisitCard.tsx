import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { GroupVisit } from '../../backend';
import { formatLongDate } from '../../utils/formatters';

interface GroupVisitCardProps {
  visit: GroupVisit;
  publisherNameMap: Map<string, string>;
  groupNumber?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function GroupVisitCard({ 
  visit, 
  publisherNameMap, 
  groupNumber,
  onEdit, 
  onDelete,
  onClick 
}: GroupVisitCardProps) {
  // Use the new field names from the backend
  const discussionTopics = visit.discussionTopics || '';
  const overseerNotes = visit.notesForOverseer || '';
  const assistantNotes = visit.notesForAssistant || '';
  const nextPlannedVisitDate = visit.nextPlannedVisitDate;

  // Map publisher IDs to names using publisherNamesPresent if available, otherwise map IDs
  const attendeeNames = visit.publisherNamesPresent && visit.publisherNamesPresent.length > 0
    ? visit.publisherNamesPresent.join(', ')
    : visit.publishersPresent
        .map((id) => publisherNameMap.get(id) || 'Unknown')
        .join(', ');

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if we have an onClick handler
    if (onClick) {
      onClick();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Card 
      className={onClick ? 'cursor-pointer transition-all hover:shadow-md active:scale-[0.99]' : ''}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with date and actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {formatLongDate(visit.visitDate)}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Discussion Topics */}
          {discussionTopics && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Discussion Topics:
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {discussionTopics}
              </p>
            </div>
          )}

          {/* Publishers Present */}
          {attendeeNames && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Publishers Present:
              </h4>
              <p className="text-sm text-muted-foreground">
                {attendeeNames}
              </p>
            </div>
          )}

          {/* Notes for Overseer */}
          {overseerNotes && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Notes for Overseer:
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {overseerNotes}
              </p>
            </div>
          )}

          {/* Notes for Assistant */}
          {assistantNotes && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Notes for Assistant:
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {assistantNotes}
              </p>
            </div>
          )}

          {/* Next Planned Visit */}
          {nextPlannedVisitDate && (
            <div>
              <p className="text-sm text-muted-foreground">
                Next visit: {formatLongDate(nextPlannedVisitDate)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
