import { useState, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useGroupVisit } from '../hooks/useGroupVisit';
import { useGetAllPublishers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { formatLongDate } from '../utils/formatters';
import RecordGroupVisitModal from '../components/fieldService/RecordGroupVisitModal';
import { DeleteGroupVisitDialog } from '../components/fieldService/DeleteGroupVisitDialog';
import type { GroupVisit } from '../backend';

export default function GroupVisitProfile() {
  const { groupNumber, visitId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: visit, isLoading: visitLoading } = useGroupVisit(visitId || '');
  const { data: publishers = [], isLoading: publishersLoading } = useGetAllPublishers();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Create publisher name map
  const publisherNameMap = useMemo(() => {
    const map = new Map<string, string>();
    publishers.forEach((p) => {
      map.set(p.id.toString(), p.fullName);
    });
    return map;
  }, [publishers]);

  const handleBackClick = () => {
    navigate({ to: `/field-service-groups/${groupNumber}` });
  };

  const handleDeleteSuccess = () => {
    // Navigate back to group profile after successful deletion
    navigate({ to: `/field-service-groups/${groupNumber}` });
  };

  if (visitLoading || publishersLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading visit...</span>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Visit not found</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group Profile
          </Button>
        </div>
      </div>
    );
  }

  // Validate that the visit belongs to the requested group
  if (groupNumber && Number(visit.groupNumber) !== parseInt(groupNumber, 10)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            This visit does not belong to Group {groupNumber}
          </p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Group Profile
          </Button>
        </div>
      </div>
    );
  }

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

  // Get active publishers for the group for the edit modal
  const groupPublishers = publishers.filter(
    (p) => Number(p.fieldServiceGroup) === Number(visit.groupNumber)
  );
  const sortedPublishers = [...groupPublishers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          onClick={handleBackClick}
          variant="ghost"
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Group {groupNumber}
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Group Visit - {formatLongDate(visit.visitDate)}
            </h1>
            <p className="text-muted-foreground">
              Group {visit.groupNumber} Visit Details
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Visit Details Card */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        {/* Visit Date */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Visit Date:
          </h3>
          <p className="text-lg font-semibold text-foreground">
            {formatLongDate(visit.visitDate)}
          </p>
        </div>

        {/* Discussion Topics */}
        {discussionTopics && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Discussion Topics:
            </h3>
            <p className="text-foreground whitespace-pre-wrap">
              {discussionTopics}
            </p>
          </div>
        )}

        {/* Publishers Present */}
        {attendeeNames && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Publishers Present:
            </h3>
            <p className="text-foreground">
              {attendeeNames}
            </p>
          </div>
        )}

        {/* Notes for Overseer */}
        {overseerNotes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Notes for Overseer:
            </h3>
            <p className="text-foreground whitespace-pre-wrap">
              {overseerNotes}
            </p>
          </div>
        )}

        {/* Notes for Assistant */}
        {assistantNotes && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Notes for Assistant:
            </h3>
            <p className="text-foreground whitespace-pre-wrap">
              {assistantNotes}
            </p>
          </div>
        )}

        {/* Next Planned Visit */}
        {nextPlannedVisitDate && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Next Planned Visit:
            </h3>
            <p className="text-foreground">
              {formatLongDate(nextPlannedVisitDate)}
            </p>
          </div>
        )}
      </div>

      {/* Edit Group Visit Modal */}
      <RecordGroupVisitModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        groupNumber={Number(visit.groupNumber)}
        publishers={sortedPublishers}
        visitToEdit={visit}
      />

      {/* Delete Group Visit Dialog */}
      <DeleteGroupVisitDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        visitId={visit.id}
        groupNumber={Number(visit.groupNumber)}
        onDeleted={handleDeleteSuccess}
      />
    </div>
  );
}
