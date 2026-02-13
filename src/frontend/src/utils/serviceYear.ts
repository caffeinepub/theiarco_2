/**
 * Calculates the current service year based on today's date.
 * Service year runs from September to August.
 * Returns format: "YYYY-YYYY" (e.g., "2025-2026")
 */
export function getCurrentServiceYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 8 = September)

  // If we're in September (8) through December (11), service year is currentYear-nextYear
  // If we're in January (0) through August (7), service year is lastYear-currentYear
  if (currentMonth >= 8) {
    // September through December
    return `${currentYear}-${currentYear + 1}`;
  } else {
    // January through August
    return `${currentYear - 1}-${currentYear}`;
  }
}
