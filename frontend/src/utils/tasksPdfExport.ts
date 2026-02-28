// PDF export utility for Tasks page
// Generates HTML report and downloads directly without opening a new window

import type { Task } from '../backend';
import { formatLongDate } from './formatters';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Trigger a direct file download without opening a new window
function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportTasksToPdf(tasks: Task[]): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const tableRows = tasks.map((task) => {
    const statusColor = task.isCompleted ? '#16a34a' : '#d97706';
    const statusText = task.isCompleted ? 'Completed' : 'Incomplete';
    const titleStyle = task.isCompleted
      ? 'text-decoration: line-through; color: #555;'
      : 'color: #000;';

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

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tasks Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      color: #000;
      background: #fff;
      padding: 24px;
    }
    .header {
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #000;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .report-title {
      font-size: 20px;
      font-weight: 700;
      color: #000;
    }
    .report-meta {
      font-size: 9px;
      color: #333;
      text-align: right;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    thead tr {
      background-color: #333;
      color: #fff;
    }
    thead th {
      padding: 6px 8px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      border: 1px solid #000;
    }
    tbody tr:nth-child(even) {
      background-color: #f5f5f5;
    }
    tbody td {
      padding: 5px 8px;
      border: 1px solid #ccc;
      font-size: 10px;
      vertical-align: top;
      color: #000;
    }
    .footer {
      margin-top: 14px;
      font-size: 9px;
      color: #555;
      text-align: right;
      border-top: 1px solid #ccc;
      padding-top: 6px;
    }
    @media print {
      body { padding: 10px; }
      @page { size: portrait; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="report-title">Tasks Report</div>
      <div style="font-size:9px;color:#333;margin-top:2px;">Theiarco</div>
    </div>
    <div class="report-meta">
      <div>${dateStr}</div>
      <div>${tasks.length} task${tasks.length !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:28%;">Title</th>
        <th style="width:16%;">Due Date</th>
        <th style="width:16%;">Category</th>
        <th style="width:14%;">Status</th>
        <th style="width:26%;">Notes</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="5" style="text-align:center;padding:14px;color:#555;">No tasks available</td></tr>'}
    </tbody>
  </table>
  <div class="footer">Theiarco &bull; Tasks Report &bull; ${dateStr}</div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  downloadBlob(html, 'tasks-report.html', 'text/html');
}
