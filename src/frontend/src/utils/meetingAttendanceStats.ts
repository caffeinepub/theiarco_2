import type { MeetingAttendance, Publisher } from '../backend';

/**
 * Calculate the total number of active publishers in a group
 */
export function calculateTotalActivePublishers(
  publishers: Publisher[],
  groupNumber: number
): number {
  return publishers.filter(
    (p) => Number(p.fieldServiceGroup) === groupNumber && p.isActive
  ).length;
}

/**
 * Calculate average attendance for a specific meeting type
 * Supports both legacy "Weekday Meeting" and new "Mid-week Meeting" terminology
 */
export function calculateAverageAttendance(
  attendanceRecords: MeetingAttendance[],
  meetingType: 'weekday' | 'weekend'
): number {
  const filteredRecords = attendanceRecords.filter((record) => {
    const type = record.meetingType.toLowerCase();
    if (meetingType === 'weekday') {
      // Include both "weekday" and "mid-week" for backward compatibility
      return type.includes('weekday') || type.includes('mid-week');
    } else {
      return type.includes('weekend');
    }
  });

  if (filteredRecords.length === 0) {
    return 0;
  }

  const totalPresent = filteredRecords.reduce(
    (sum, record) => sum + record.publisherNamesPresent.length,
    0
  );

  return totalPresent / filteredRecords.length;
}

/**
 * Calculate percentage of total active publishers
 */
export function calculatePercentage(
  average: number,
  totalActive: number
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
