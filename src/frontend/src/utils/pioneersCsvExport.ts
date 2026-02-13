// CSV export utility for Pioneers page

// Month ordering for service year (September through August)
const SERVICE_YEAR_MONTHS = [
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
];

// CSV field escaping: wrap in quotes if contains comma, quote, or newline
function escapeCsvField(field: string | number): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Build CSV string from rows
function buildCsvString(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

// Trigger browser download
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Generate CSV header row
export function getCsvHeaders(): string[] {
  return [
    'Pioneer Name',
    'Service Year',
    'Total Hours',
    'Average Hours',
    'Current Status',
    ...SERVICE_YEAR_MONTHS.map((month) => `${month} Hours`),
  ];
}

// Get month ordering for service year
export function getServiceYearMonths(): string[] {
  return SERVICE_YEAR_MONTHS;
}

// Build CSV content from pioneer data
export function buildPioneersCsv(
  pioneersData: Array<{
    pioneerName: string;
    serviceYear: string;
    totalHours: number;
    averageHours: number;
    currentStatus: string;
    monthlyHours: Record<string, number>;
  }>
): string {
  const headers = getCsvHeaders();
  const rows: string[][] = [headers];

  pioneersData.forEach((pioneer) => {
    const row = [
      pioneer.pioneerName,
      pioneer.serviceYear,
      pioneer.totalHours.toString(),
      pioneer.averageHours.toFixed(1),
      pioneer.currentStatus,
      ...SERVICE_YEAR_MONTHS.map((month) => {
        const hours = pioneer.monthlyHours[month];
        return hours !== undefined ? hours.toString() : '0';
      }),
    ];
    rows.push(row);
  });

  return buildCsvString(rows);
}
