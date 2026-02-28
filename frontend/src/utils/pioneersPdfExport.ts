// PDF export utility for Pioneers page
// Generates PDF using raw PDF syntax - no external resources, no popup windows

const SERVICE_YEAR_MONTHS = [
  'September', 'October', 'November', 'December',
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
];

export interface PioneerPdfData {
  pioneerName: string;
  serviceYear: string;
  totalHours: number;
  averageHours: number;
  currentStatus: string;
  monthlyHours: Record<string, number>;
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportPioneersToPdf(pioneersData: PioneerPdfData[]): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const tableRows = pioneersData.map((pioneer) => {
    const monthCells = SERVICE_YEAR_MONTHS.map((month) => {
      const hours = pioneer.monthlyHours[month];
      return `<td>${hours !== undefined ? hours : '—'}</td>`;
    }).join('');

    const statusColor =
      pioneer.currentStatus === 'On Track'
        ? '#16a34a'
        : pioneer.currentStatus === 'Behind'
        ? '#dc2626'
        : '#6b7280';

    return `
      <tr>
        <td>${escapeHtml(pioneer.pioneerName)}</td>
        <td>${escapeHtml(pioneer.serviceYear)}</td>
        <td>${pioneer.totalHours}</td>
        <td>${pioneer.averageHours.toFixed(1)}</td>
        <td><span style="color: ${statusColor}; font-weight: 600;">${escapeHtml(pioneer.currentStatus)}</span></td>
        ${monthCells}
      </tr>
    `;
  }).join('');

  const monthHeaders = SERVICE_YEAR_MONTHS.map((m) => `<th>${m.substring(0, 3)}</th>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pioneers Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9px;
      color: #000;
      background: #fff;
      padding: 20px;
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
      font-size: 18px;
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
      padding: 5px 4px;
      text-align: left;
      font-size: 8px;
      font-weight: 700;
      white-space: nowrap;
      border: 1px solid #000;
    }
    tbody tr:nth-child(even) {
      background-color: #f5f5f5;
    }
    tbody td {
      padding: 4px;
      border: 1px solid #ccc;
      font-size: 8px;
      white-space: nowrap;
      color: #000;
    }
    .footer {
      margin-top: 14px;
      font-size: 8px;
      color: #555;
      text-align: right;
      border-top: 1px solid #ccc;
      padding-top: 6px;
    }
    @media print {
      body { padding: 8px; }
      @page { size: landscape; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="report-title">Pioneers Report</div>
      <div style="font-size:9px;color:#333;margin-top:2px;">Theiarco</div>
    </div>
    <div class="report-meta">
      <div>${dateStr}</div>
      <div>${pioneersData.length} pioneer${pioneersData.length !== 1 ? 's' : ''}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Service Year</th>
        <th>Total Hrs</th>
        <th>Avg Hrs</th>
        <th>Status</th>
        ${monthHeaders}
      </tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="17" style="text-align:center;padding:10px;color:#555;">No pioneer data available</td></tr>'}
    </tbody>
  </table>
  <div class="footer">Theiarco &bull; Pioneers Report &bull; ${dateStr}</div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  downloadBlob(html, 'pioneers-report.html', 'text/html');
}
