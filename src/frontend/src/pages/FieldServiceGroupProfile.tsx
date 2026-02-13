import { useState, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetAllPublishers } from '../hooks/useQueries';
import { useGroupVisits } from '../hooks/useGroupVisits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RecordGroupVisitModal from '../components/fieldService/RecordGroupVisitModal';
import { GroupVisitCard } from '../components/fieldService/GroupVisitCard';
import { DeleteGroupVisitDialog } from '../components/fieldService/DeleteGroupVisitDialog';
import type { Publisher, GroupVisit } from '../backend';

export default function FieldServiceGroupProfile() {
  const { groupNumber } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: publishers = [], isLoading } = useGetAllPublishers();
  const [isRecordVisitModalOpen, setIsRecordVisitModalOpen] = useState(false);
  const [visitToEdit, setVisitToEdit] = useState<GroupVisit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<{ id: string; groupNumber: number } | null>(null);

  // Validate groupNumber
  const groupNum = groupNumber ? parseInt(groupNumber, 10) : NaN;
  const isValidGroup = !isNaN(groupNum) && groupNum >= 1 && groupNum <= 4;

  // Fetch group visits (must be called before any conditional returns)
  const { data: groupVisits = [], isLoading: visitsLoading } = useGroupVisits(groupNum);

  // Create publisher name map for visit cards (must be called before any conditional returns)
  const publisherNameMap = useMemo(() => {
    const map = new Map<string, string>();
    publishers.forEach((p) => {
      map.set(p.id.toString(), p.fullName);
    });
    return map;
  }, [publishers]);

  // Sort visits by date descending (must be called before any conditional returns)
  const sortedVisits = useMemo(() => {
    return [...groupVisits].sort((a, b) => {
      const dateA = Number(a.visitDate);
      const dateB = Number(b.visitDate);
      return dateB - dateA; // Descending order
    });
  }, [groupVisits]);

  const handleBackClick = () => {
    navigate({ to: '/field-service-groups' });
  };

  const handleVisitClick = (visitId: string) => {
    navigate({ 
      to: `/field-service-groups/${groupNum}/visits/${visitId}` 
    });
  };

  const handleEditVisit = (visit: GroupVisit) => {
    setVisitToEdit(visit);
    setIsRecordVisitModalOpen(true);
  };

  const handleDeleteVisit = (visit: GroupVisit) => {
    setVisitToDelete({ id: visit.id, groupNumber: Number(visit.groupNumber) });
  };

  const handleModalClose = (open: boolean) => {
    setIsRecordVisitModalOpen(open);
    if (!open) {
      // Clear visitToEdit when modal closes
      setVisitToEdit(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Loading group...</span>
        </div>
      </div>
    );
  }

  if (!isValidGroup) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Invalid group number</p>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Field Service Groups
          </Button>
        </div>
      </div>
    );
  }

  // Filter publishers for this group
  const groupPublishers = publishers.filter(
    (p) => Number(p.fieldServiceGroup) === groupNum
  );

  // Find overseer and assistant
  const overseer = groupPublishers.find((p) => p.isGroupOverseer);
  const assistant = groupPublishers.find((p) => p.isGroupAssistant);

  // Sort publishers alphabetically
  const sortedPublishers = [...groupPublishers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  // Helper function to get badges for a publisher
  const getPublisherBadges = (publisher: Publisher) => {
    const badges: { label: string; variant: 'default' | 'secondary' | 'outline' }[] = [];

    if (publisher.isGroupOverseer) {
      badges.push({ label: 'Overseer', variant: 'secondary' });
    }
    if (publisher.isGroupAssistant) {
      badges.push({ label: 'Assistant', variant: 'secondary' });
    }
    if (publisher.privileges.elder) {
      badges.push({ label: 'Elder', variant: 'default' });
    }
    if (publisher.privileges.servant) {
      badges.push({ label: 'Ministerial Servant', variant: 'default' });
    }

    return badges;
  };

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
          Back to Field Service Groups
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Group {groupNum}
          </h1>
          <p className="text-muted-foreground">Group details and members</p>
        </div>
      </div>

      {/* Group Leadership Section */}
      <div className="rounded-lg border bg-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Group Leadership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overseer */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Overseer
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {overseer ? overseer.fullName : 'No overseer assigned'}
            </p>
          </div>

          {/* Assistant */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Assistant
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {assistant ? assistant.fullName : 'No assistant assigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Publishers Section */}
      <div className="rounded-lg border bg-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Publishers
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({sortedPublishers.length} {sortedPublishers.length === 1 ? 'publisher' : 'publishers'})
          </span>
        </h2>

        {sortedPublishers.length > 0 ? (
          <div className="space-y-3">
            {sortedPublishers.map((publisher) => {
              const badges = getPublisherBadges(publisher);
              return (
                <div
                  key={publisher.id.toString()}
                  className="flex items-center gap-2 py-2"
                >
                  <span className="text-foreground font-medium">
                    {publisher.fullName}
                  </span>
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  ))}
                  {!publisher.isActive && (
                    <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                      Inactive
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No publishers in this group
          </p>
        )}
      </div>

      {/* Group Visits Section */}
      <div className="rounded-lg border bg-card p-6">
        {/* Header with Record Visit Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Group Visits
          </h2>
          <Button
            onClick={() => setIsRecordVisitModalOpen(true)}
            style={{ backgroundColor: '#43587A' }}
            className="hover:opacity-90 text-white"
          >
            Record Visit
          </Button>
        </div>

        {/* Visit History Subheading */}
        <h3 className="text-sm font-medium text-foreground mb-3">
          Visit History
        </h3>

        {/* Visit History Content */}
        {visitsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading visits...</span>
          </div>
        ) : sortedVisits.length === 0 ? (
          <p className="text-muted-foreground">
            No visits recorded
          </p>
        ) : (
          <div className="space-y-4">
            {sortedVisits.map((visit) => (
              <GroupVisitCard
                key={visit.id}
                visit={visit}
                publisherNameMap={publisherNameMap}
                groupNumber={groupNum}
                onClick={() => handleVisitClick(visit.id)}
                onEdit={() => handleEditVisit(visit)}
                onDelete={() => handleDeleteVisit(visit)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Record Group Visit Modal */}
      <RecordGroupVisitModal
        open={isRecordVisitModalOpen}
        onOpenChange={handleModalClose}
        groupNumber={groupNum}
        publishers={sortedPublishers}
        visitToEdit={visitToEdit}
      />

      {/* Delete Group Visit Dialog */}
      {visitToDelete && (
        <DeleteGroupVisitDialog
          open={!!visitToDelete}
          onOpenChange={(open) => !open && setVisitToDelete(null)}
          visitId={visitToDelete.id}
          groupNumber={visitToDelete.groupNumber}
        />
      )}
    </div>
  );
}
