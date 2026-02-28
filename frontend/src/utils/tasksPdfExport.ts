// PDF export utility for Tasks page
// Uses browser print API to generate a styled PDF

import type { Task } from '../backend';
import { formatLongDate } from './formatters';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openPrintWindow(html: string): void {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow pop-ups to export PDF.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportTasksToPdf(tasks: Task[]): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const tableRows = tasks.map((task) => {
    const statusColor = task.isCompleted ? '#16a34a' : '#d97706';
    const statusText = task.isCompleted ? 'Completed' : 'Incomplete';
    const titleStyle = task.isCompleted ? 'text-decoration: line-through; color: #6b7280;' : 'color: #111;';

    return `
      <tr>
        <td style="${titleStyle}">${escapeHtml(task.title)}</td>
        <td>${escapeHtml(formatLongDate(task.dueDate))}</td>
        <td>${escapeHtml(task.category)}</td>
        <td><span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></td>
        <td>${task.notes ? escapeHtml(task.notes) : '—'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Tasks Report – Theiarco</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 10px;
          color: #111;
          background: #fff;
          padding: 24px;
        }
        .header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 3px solid #43587A;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-left .app-name {
          font-size: 11px;
          font-weight: 700;
          color: #43587A;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .header-left .report-title {
          font-size: 22px;
          font-weight: 700;
          color: #111;
          margin-top: 2px;
        }
        .header-right {
          text-align: right;
        }
        .header-right .date-label {
          font-size: 10px;
          color: #555;
        }
        .header-right .count-label {
          font-size: 9px;
          color: #888;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        thead tr {
          background-color: #43587A;
          color: #fff;
        }
        thead th {
          padding: 7px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
        }
        tbody tr {
          background-color: #fff;
        }
        tbody tr:nth-child(even) {
          background-color: #f0f3f7;
        }
        tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid #dde3ec;
          font-size: 10px;
          vertical-align: top;
          color: #111;
        }
        .footer {
          margin-top: 16px;
          font-size: 9px;
          color: #888;
          text-align: right;
          border-top: 1px solid #dde3ec;
          padding-top: 8px;
        }
        .footer strong {
          color: #43587A;
        }
        @media print {
          body { padding: 10px; }
          @page { size: portrait; margin: 12mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <div class="app-name">Theiarco</div>
          <div class="report-title">Tasks Report</div>
        </div>
        <div class="header-right">
          <div class="date-label">${dateStr}</div>
          <div class="count-label">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">Title</th>
            <th style="width: 16%;">Due Date</th>
            <th style="width: 16%;">Category</th>
            <th style="width: 14%;">Status</th>
            <th style="width: 26%;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#888;">No tasks available</td></tr>'}
        </tbody>
      </table>
      <div class="footer"><strong>Theiarco</strong> &bull; Tasks Report &bull; ${dateStr}</div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  openPrintWindow(html);
}
