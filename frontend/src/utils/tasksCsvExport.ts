import { formatLongDate } from './formatters';
import type { Task } from '../backend';

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

// Build CSV content from tasks data
export function buildTasksCsv(tasks: Task[]): string {
  const headers = ['Task Title', 'Due Date', 'Category', 'Status', 'Notes'];
  const rows: string[][] = [headers];

  tasks.forEach((task) => {
    const row = [
      task.title,
      formatLongDate(task.dueDate),
      task.category,
      task.isCompleted ? 'Completed' : 'Incomplete',
      task.notes || '',
    ];
    rows.push(row);
  });

  return buildCsvString(rows);
}
