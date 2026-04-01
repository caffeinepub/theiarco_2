import type { MeetingAttendance, Publisher } from "../backend";

/**
 * Calculate the total number of active publishers in a group
 */
export function calculateTotalActivePublishers(
  publishers: Publisher[],
  groupNumber: number,
): number {
  return publishers.filter(
    (p) => Number(p.fieldServiceGroup) === groupNumber && p.isActive,
  ).length;
}

/**
 * Calculate average attendance for a specific meeting type
 * Supports both legacy "Weekday Meeting" and new "Mid-week Meeting" terminology
 */
export function calculateAverageAttendance(
  attendanceRecords: MeetingAttendance[],
  meetingType: "weekday" | "weekend",
): number {
  const filteredRecords = attendanceRecords.filter((record) => {
    const type = record.meetingType.toLowerCase();
    if (meetingType === "weekday") {
      // Include both "weekday" and "mid-week" for backward compatibility
      return type.includes("weekday") || type.includes("mid-week");
    }
    return type.includes("weekend");
  });

  if (filteredRecords.length === 0) {
    return 0;
  }

  const totalPresent = filteredRecords.reduce(
    (sum, record) => sum + record.publisherNamesPresent.length,
    0,
  );

  return totalPresent / filteredRecords.length;
}

/**
 * Calculate percentage of total active publishers
 */
export function calculatePercentage(
  average: number,
  totalActive: number,
): number {
  if (totalActive === 0) {
    return 0;
  }
  return Math.round((average / totalActive) * 100);
}

/**
 * Format the count display (e.g., "2 of 3")
 */
export function formatCountDisplay(average: number, total: number): string {
  const roundedAverage = Math.round(average);
  return `${roundedAverage} of ${total}`;
}

/**
 * Compute meeting attendance overview statistics across all groups
 * Returns total records count and average attendance percentage
 */
export function computeMeetingAttendanceOverview(
  attendanceRecords: MeetingAttendance[],
  publishers: Publisher[],
): { totalRecords: number; averagePercentage: number } {
  const totalRecords = attendanceRecords.length;

  if (totalRecords === 0) {
    return { totalRecords: 0, averagePercentage: 0 };
  }

  // Calculate total present across all records
  const totalPresent = attendanceRecords.reduce(
    (sum, record) => sum + record.publishersPresent.length,
    0,
  );

  // Calculate total possible attendance across all records
  // For each record, count active publishers in that group at the time
  const totalPossible = attendanceRecords.reduce((sum, record) => {
    const groupNumber = Number(record.groupNumber);
    const activePublishersInGroup = publishers.filter(
      (p) => Number(p.fieldServiceGroup) === groupNumber && p.isActive,
    ).length;
    return sum + activePublishersInGroup;
  }, 0);

  // Calculate average percentage
  if (totalPossible === 0) {
    return { totalRecords, averagePercentage: 0 };
  }

  const averagePercentage = Math.round((totalPresent / totalPossible) * 100);

  return { totalRecords, averagePercentage };
}
