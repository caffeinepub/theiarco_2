/**
 * Converts a backend timestamp (bigint) to a formatted date string.
 * Backend timestamps are in nanoseconds; this function handles conversion defensively.
 * @param timestamp - Backend timestamp as bigint (nanoseconds)
 * @returns Formatted date string like "Feb 3, 2026"
 */
export function formatNoteDate(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a backend timestamp (bigint) to a formatted date string for tasks.
 * Backend task timestamps are in seconds; this function converts to milliseconds.
 * @param timestamp - Backend timestamp as bigint (seconds)
 * @returns Formatted date string like "Feb 3, 2026"
 */
export function formatTaskDate(timestamp: bigint): string {
  // Convert seconds to milliseconds
  const milliseconds = Number(timestamp) * 1000;
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a backend checkout timestamp (bigint) to a formatted date string.
 * Defensively handles both nanoseconds and seconds timestamps.
 * @param timestamp - Backend timestamp as bigint (nanoseconds or seconds)
 * @returns Formatted date string like "Feb 5, 2026"
 */
export function formatCheckoutDate(timestamp: bigint): string {
  const timestampNum = Number(timestamp);
  let milliseconds: number;
  
  // If timestamp is very large, it's likely in nanoseconds
  // Nanoseconds since epoch would be > 1 trillion for dates after 2001
  if (timestampNum > 1_000_000_000_000) {
    // Convert nanoseconds to milliseconds
    milliseconds = Number(timestamp / BigInt(1_000_000));
  } else {
    // Otherwise it's in seconds, convert to milliseconds
    milliseconds = timestampNum * 1000;
  }
  
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a backend visit timestamp (bigint) to a formatted date string.
 * Backend visit timestamps are in seconds; this function converts to milliseconds.
 * @param timestamp - Backend timestamp as bigint (seconds)
 * @returns Formatted date string like "Feb 7, 2026"
 */
export function formatVisitDate(timestamp: bigint): string {
  // Convert seconds to milliseconds
  const milliseconds = Number(timestamp) * 1000;
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a backend weekOf timestamp (bigint) to a formatted date string.
 * Backend weekOf timestamps are in seconds for the Monday of that week.
 * @param timestamp - Backend timestamp as bigint (seconds)
 * @returns Formatted date string like "Feb 10, 2026"
 */
export function formatWeekOfDate(timestamp: bigint): string {
  // Convert seconds to milliseconds
  const milliseconds = Number(timestamp) * 1000;
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a backend training date timestamp (bigint) to a formatted date string.
 * Backend training date timestamps are in seconds.
 * @param timestamp - Backend timestamp as bigint (seconds)
 * @returns Formatted date string like "Feb 7, 2026"
 */
export function formatTrainingDate(timestamp: bigint): string {
  // Convert seconds to milliseconds
  const milliseconds = Number(timestamp) * 1000;
  const date = new Date(milliseconds);
  
  // Format as "MMM d, yyyy"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
