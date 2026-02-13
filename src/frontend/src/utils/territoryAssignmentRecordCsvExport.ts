import type { Territory, CheckoutRecord } from '../backend';

// Format date as "Jan 31, 2026" (short readable format)
function formatShortDate(timestamp: bigint | undefined | null): string {
  if (!timestamp) return '';
  
  const timestampNum = Number(timestamp);
  let milliseconds: number;
  
  // Defensively handle both nanoseconds and seconds timestamps
  if (timestampNum > 1_000_000_000_000) {
    milliseconds = Number(timestamp / BigInt(1_000_000));
  } else {
    milliseconds = timestampNum * 1000;
  }
  
  const date = new Date(milliseconds);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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
function downloadCsv(csvContent: string, filename: string): void {
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

// Get the most recent return date for a territory
function getLastDateCompleted(territory: Territory): string {
  if (!territory.checkOutHistory || territory.checkOutHistory.length === 0) {
    return '';
  }

  // Find all records with a return date
  const returnedRecords = territory.checkOutHistory.filter(
    (record) => record.dateReturned !== undefined && record.dateReturned !== null
  );

  if (returnedRecords.length === 0) {
    return '';
  }

  // Find the most recent return date
  const mostRecentReturned = returnedRecords.reduce((latest, current) => {
    const latestDate = Number(latest.dateReturned || 0);
    const currentDate = Number(current.dateReturned || 0);
    return currentDate > latestDate ? current : latest;
  });

  return formatShortDate(mostRecentReturned.dateReturned);
}

// Get the 4 most recent checkout records sorted by dateCheckedOut descending
function getMostRecentCheckouts(territory: Territory): CheckoutRecord[] {
  if (!territory.checkOutHistory || territory.checkOutHistory.length === 0) {
    return [];
  }

  // Sort by dateCheckedOut descending (most recent first)
  const sorted = [...territory.checkOutHistory].sort((a, b) => {
    return Number(b.dateCheckedOut) - Number(a.dateCheckedOut);
  });

  // Return up to 4 most recent
  return sorted.slice(0, 4);
}

// Build CSV content for S-13-E Territory Assignment Record
export function buildTerritoryAssignmentRecordCsv(territories: Territory[]): string {
  // S-13-E column headers
  const headers = [
    'Territory Number',
    'Last Date Completed',
    'Publisher 1 Name',
    'Date Assigned 1',
    'Date Completed 1',
    'Publisher 2 Name',
    'Date Assigned 2',
    'Date Completed 2',
    'Publisher 3 Name',
    'Date Assigned 3',
    'Date Completed 3',
    'Publisher 4 Name',
    'Date Assigned 4',
    'Date Completed 4',
  ];

  const rows: string[][] = [headers];

  territories.forEach((territory) => {
    const lastDateCompleted = getLastDateCompleted(territory);
    const recentCheckouts = getMostRecentCheckouts(territory);

    // Build row with territory number and last date completed
    const row: string[] = [
      territory.number,
      lastDateCompleted,
    ];

    // Add up to 4 checkout records
    for (let i = 0; i < 4; i++) {
      if (i < recentCheckouts.length) {
        const record = recentCheckouts[i];
        row.push(
          record.publisherName || '',
          formatShortDate(record.dateCheckedOut),
          formatShortDate(record.dateReturned)
        );
      } else {
        // Empty columns for missing checkout records
        row.push('', '', '');
      }
    }

    rows.push(row);
  });

  return buildCsvString(rows);
}

// Export territories to CSV
export function exportTerritoryAssignmentRecord(territories: Territory[]): void {
  const csvContent = buildTerritoryAssignmentRecordCsv(territories);
  downloadCsv(csvContent, 'territory-assignment-record.csv');
}
