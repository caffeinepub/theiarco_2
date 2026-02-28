/**
 * Territory timestamp utilities for normalizing and calculating durations.
 * Backend stores timestamps in seconds since epoch.
 */

/**
 * Normalize a backend timestamp (bigint) to JavaScript milliseconds.
 * Defensively handles seconds, milliseconds, and legacy nanoseconds.
 */
export function normalizeTimestampToMs(timestamp: bigint): number {
  const num = Number(timestamp);
  
  // If it looks like nanoseconds (>1e15), convert from nanoseconds
  if (num > 1e15) {
    return Math.floor(num / 1_000_000);
  }
  
  // If it looks like milliseconds (>1e12), use as-is
  if (num > 1e12) {
    return num;
  }
  
  // Otherwise treat as seconds and convert to milliseconds
  return num * 1000;
}

/**
 * Normalize any timestamp value to epoch seconds for backend submission.
 * Ensures the value is always in seconds regardless of input format.
 */
export function normalizeToEpochSeconds(timestamp: bigint): bigint {
  const num = Number(timestamp);
  
  // If it looks like nanoseconds (>1e15), convert to seconds
  if (num > 1e15) {
    return BigInt(Math.floor(num / 1_000_000_000));
  }
  
  // If it looks like milliseconds (>1e12), convert to seconds
  if (num > 1e12) {
    return BigInt(Math.floor(num / 1000));
  }
  
  // Already in seconds
  return timestamp;
}

/**
 * Calculate duration between a checkout date and today.
 * Returns whole months if >= 1 month, otherwise whole days.
 */
export function calculateCheckoutDuration(dateCheckedOut: bigint): {
  months: number;
  days: number;
  displayText: string;
} {
  const checkoutMs = normalizeTimestampToMs(dateCheckedOut);
  const checkoutDate = new Date(checkoutMs);
  const now = new Date();
  
  const diffMs = now.getTime() - checkoutDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.44); // Average days per month
  
  let displayText: string;
  if (diffMonths >= 1) {
    displayText = diffMonths === 1 ? '1 month' : `${diffMonths} months`;
  } else {
    displayText = diffDays === 1 ? '1 day' : `${diffDays} days`;
  }
  
  return {
    months: diffMonths,
    days: diffDays,
    displayText,
  };
}

/**
 * Get numeric duration in months for sorting purposes.
 * Returns the fractional month value for accurate sorting.
 */
export function getCheckoutDurationMonths(dateCheckedOut: bigint): number {
  const checkoutMs = normalizeTimestampToMs(dateCheckedOut);
  const checkoutDate = new Date(checkoutMs);
  const now = new Date();
  
  const diffMs = now.getTime() - checkoutDate.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
  
  return diffMonths;
}
