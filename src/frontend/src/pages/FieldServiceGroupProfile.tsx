import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { GroupVisit, MeetingAttendance, Publisher } from "../backend";
import AttendanceStatsSummaryCard from "../components/fieldService/AttendanceStatsSummaryCard";
import { DeleteAttendanceDialog } from "../components/fieldService/DeleteAttendanceDialog";
import { DeleteGroupVisitDialog } from "../components/fieldService/DeleteGroupVisitDialog";
import { GroupVisitCard } from "../components/fieldService/GroupVisitCard";
import RecordAttendanceModal from "../components/fieldService/RecordAttendanceModal";
import RecordGroupVisitModal from "../components/fieldService/RecordGroupVisitModal";
import { useGroupVisits } from "../hooks/useGroupVisits";
import { useGetMeetingAttendance } from "../hooks/useMeetingAttendance";
import { useGetAllPublishers } from "../hooks/useQueries";
import { getGroupColor } from "../utils/fieldServiceGroupColors";
import { formatLongDate } from "../utils/formatters";
import {
  calculateAverageAttendance,
  calculateTotalActivePublishers,
} from "../utils/meetingAttendanceStats";
import { getPrivilegeBadgeClassName } from "../utils/privilegeBadges";

export default function FieldServiceGroupProfile() {
  const { groupNumber } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: publishers = [], isLoading } = useGetAllPublishers();
  const [isRecordVisitModalOpen, setIsRecordVisitModalOpen] = useState(false);
  const [isRecordAttendanceModalOpen, setIsRecordAttendanceModalOpen] =
    useState(false);
  const [visitToEdit, setVisitToEdit] = useState<GroupVisit | null>(null);
  const [attendanceToEdit, setAttendanceToEdit] =
    useState<MeetingAttendance | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<{
    id: string;
    groupNumber: number;
  } | null>(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState<string | null>(
    null,
  );

  // Validate groupNumber
  const groupNum = groupNumber ? Number.parseInt(groupNumber, 10) : Number.NaN;
  const isValidGroup =
    !Number.isNaN(groupNum) && groupNum >= 1 && groupNum <= 4;

  // Get group color
  const groupColor = isValidGroup ? getGroupColor(groupNum) : "#6B7280";

  // Fetch group visits (must be called before any conditional returns)
  const { data: groupVisits = [], isLoading: visitsLoading } =
    useGroupVisits(groupNum);

  // Fetch meeting attendance records for this group
  const { data: attendanceRecords = [], isLoading: attendanceLoading } =
    useGetMeetingAttendance(groupNum);

  // Create publisher name map for visit cards (must be called before any conditional returns)
  const publisherNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of publishers) {
      map.set(p.id.toString(), p.fullName);
    }
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

  // Sort attendance records by date descending (most recent first)
  const sortedAttendance = useMemo(() => {
    return [...attendanceRecords].sort((a, b) => {
      const dateA = Number(a.meetingDate);
      const dateB = Number(b.meetingDate);
      return dateB - dateA; // Descending order
    });
  }, [attendanceRecords]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const totalActive = calculateTotalActivePublishers(publishers, groupNum);
    const weekdayAvg = calculateAverageAttendance(attendanceRecords, "weekday");
    const weekendAvg = calculateAverageAttendance(attendanceRecords, "weekend");

    return {
      totalPublishers: totalActive,
      weekdayAverage: weekdayAvg,
      weekendAverage: weekendAvg,
      hasData: attendanceRecords.length > 0,
    };
  }, [publishers, attendanceRecords, groupNum]);

  const handleBackClick = () => {
    navigate({ to: "/field-service-groups" });
  };

  const handleVisitClick = (visitId: string) => {
    navigate({
      to: `/field-service-groups/${groupNum}/visits/${visitId}`,
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

  const handleRecordAttendance = () => {
    setAttendanceToEdit(null);
    setIsRecordAttendanceModalOpen(true);
  };

  const handleEditAttendance = (attendance: MeetingAttendance) => {
    setAttendanceToEdit(attendance);
    setIsRecordAttendanceModalOpen(true);
  };

  const handleDeleteAttendance = (attendance: MeetingAttendance) => {
    setAttendanceToDelete(attendance.id);
  };

  const handleAttendanceModalClose = (open: boolean) => {
    setIsRecordAttendanceModalOpen(open);
    if (!open) {
      setAttendanceToEdit(null);
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
    (p) => Number(p.fieldServiceGroup) === groupNum,
  );

  // Find overseer and assistant
  const overseer = groupPublishers.find((p) => p.isGroupOverseer);
  const assistant = groupPublishers.find((p) => p.isGroupAssistant);

  // Sort publishers alphabetically
  const sortedPublishers = [...groupPublishers].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  // Helper function to get badges for a publisher
  const getPublisherBadges = (publisher: Publisher) => {
    const badges: {
      label: string;
      variant?: "default" | "secondary" | "outline";
      className?: string;
    }[] = [];

    if (publisher.isGroupOverseer) {
      badges.push({
        label: "Overseer",
        className: "bg-black text-white hover:bg-black",
      });
    }
    if (publisher.isGroupAssistant) {
      badges.push({
        label: "Assistant",
        className: "bg-gray-500 text-white hover:bg-gray-500",
      });
    }
    if (publisher.privileges.elder) {
      badges.push({
        label: "Elder",
        className: getPrivilegeBadgeClassName("Elder"),
      });
    }
    if (publisher.privileges.servant) {
      badges.push({
        label: "MS",
        className: getPrivilegeBadgeClassName("Ministerial Servant"),
      });
    }

    return badges;
  };

  // Helper function to normalize meeting type display
  const normalizeMeetingType = (meetingType: string): string => {
    return meetingType === "Weekday Meeting" ? "Mid-week Meeting" : meetingType;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Field Service Groups
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-3 h-8 rounded-sm"
            style={{ backgroundColor: groupColor }}
          />
          <h1 className="text-3xl font-bold" style={{ color: groupColor }}>
            Group {groupNum}
          </h1>
        </div>
      </div>

      {/* Group Leadership Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Group Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overseer Card */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Group Overseer
            </h3>
            {overseer ? (
              <div>
                <p className="font-medium">{overseer.fullName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getPublisherBadges(overseer).map((badge) => (
                    <Badge
                      key={badge.label}
                      variant={badge.variant}
                      className={badge.className}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </div>

          {/* Assistant Card */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Group Assistant
            </h3>
            {assistant ? (
              <div>
                <p className="font-medium">{assistant.fullName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getPublisherBadges(assistant).map((badge) => (
                    <Badge
                      key={badge.label}
                      variant={badge.variant}
                      className={badge.className}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Not assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Publishers List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Publishers ({groupPublishers.length})
        </h2>
        {sortedPublishers.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-muted-foreground">No publishers in this group</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card divide-y">
            {sortedPublishers.map((publisher) => (
              <div
                key={publisher.id.toString()}
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{publisher.fullName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getPublisherBadges(publisher).map((badge) => (
                        <Badge
                          key={badge.label}
                          variant={badge.variant}
                          className={badge.className}
                        >
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {!publisher.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Visits Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Group Visits</h2>
          <Button
            onClick={() => {
              setVisitToEdit(null);
              setIsRecordVisitModalOpen(true);
            }}
            style={{ backgroundColor: groupColor }}
            className="text-white hover:opacity-90"
          >
            Record Visit
          </Button>
        </div>

        {visitsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading visits...</span>
          </div>
        ) : sortedVisits.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              No group visits recorded yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedVisits.map((visit) => (
              <GroupVisitCard
                key={visit.id}
                visit={visit}
                publisherNameMap={publisherNameMap}
                onClick={() => handleVisitClick(visit.id)}
                onEdit={() => handleEditVisit(visit)}
                onDelete={() => handleDeleteVisit(visit)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Meeting Attendance Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Meeting Attendance</h2>

        {/* Attendance Statistics Summary */}
        <AttendanceStatsSummaryCard
          totalPublishers={attendanceStats.totalPublishers}
          weekdayAverage={attendanceStats.weekdayAverage}
          weekendAverage={attendanceStats.weekendAverage}
          groupColor={groupColor}
          hasData={attendanceStats.hasData}
        />

        {/* Attendance Records */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Attendance Records</h3>
          <Button
            onClick={handleRecordAttendance}
            style={{ backgroundColor: groupColor }}
            className="text-white hover:opacity-90"
          >
            Record Attendance
          </Button>
        </div>

        {attendanceLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Loading attendance...</span>
          </div>
        ) : sortedAttendance.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center">
            <p className="text-muted-foreground">No attendance records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAttendance.map((attendance) => {
              const formattedDate = formatLongDate(attendance.meetingDate);
              const displayMeetingType = normalizeMeetingType(
                attendance.meetingType,
              );

              return (
                <div
                  key={attendance.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg">
                          {displayMeetingType}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {formattedDate}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {attendance.publisherNamesPresent.length} publisher
                        {attendance.publisherNamesPresent.length !== 1
                          ? "s"
                          : ""}{" "}
                        present
                      </p>
                      {attendance.publisherNamesPresent.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attendance.publisherNamesPresent.map((name) => (
                            <Badge key={name} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAttendance(attendance)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAttendance(attendance)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <RecordGroupVisitModal
        open={isRecordVisitModalOpen}
        onOpenChange={handleModalClose}
        groupNumber={groupNum}
        publishers={groupPublishers}
        visitToEdit={visitToEdit}
      />

      <RecordAttendanceModal
        open={isRecordAttendanceModalOpen}
        onOpenChange={handleAttendanceModalClose}
        groupNumber={groupNum}
        publishers={groupPublishers}
        attendanceToEdit={attendanceToEdit}
      />

      {visitToDelete && (
        <DeleteGroupVisitDialog
          open={!!visitToDelete}
          onOpenChange={(open) => !open && setVisitToDelete(null)}
          visitId={visitToDelete.id}
          groupNumber={visitToDelete.groupNumber}
          onDeleted={() => setVisitToDelete(null)}
        />
      )}

      {attendanceToDelete && (
        <DeleteAttendanceDialog
          open={!!attendanceToDelete}
          onOpenChange={(open) => !open && setAttendanceToDelete(null)}
          attendanceId={attendanceToDelete}
          onDeleted={() => setAttendanceToDelete(null)}
        />
      )}
    </div>
  );
}
