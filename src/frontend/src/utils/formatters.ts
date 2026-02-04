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
