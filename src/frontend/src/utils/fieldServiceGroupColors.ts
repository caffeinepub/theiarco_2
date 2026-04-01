// Color mapping for Field Service Groups 1-4
export const FIELD_SERVICE_GROUP_COLORS: Record<number, string> = {
  1: "#6B21A8", // Dark Purple
  2: "#1E40AF", // Dark Blue
  3: "#0B6623", // Dark Green
  4: "#F59E0B", // Gold/Yellow (Amber)
};

export function getGroupColor(groupNumber: number): string {
  return FIELD_SERVICE_GROUP_COLORS[groupNumber] || "#6B7280"; // fallback to gray
}
