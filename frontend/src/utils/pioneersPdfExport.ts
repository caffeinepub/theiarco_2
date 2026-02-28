// PDF export utility for Pioneers page
// Uses browser print API to generate a styled PDF

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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Pioneers Report – Theiarco</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9px;
          color: #111;
          background: #fff;
          padding: 20px;
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
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin-top: 2px;
        }
        .header-right {
          text-align: right;
        }
        .header-right .date-label {
          font-size: 9px;
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
          padding: 6px 4px;
          text-align: left;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }
        tbody tr:nth-child(even) {
          background-color: #f0f3f7;
        }
        tbody tr {
          background-color: #fff;
        }
        tbody tr:nth-child(even) {
          background-color: #f0f3f7;
        }
        tbody td {
          padding: 5px 4px;
          border-bottom: 1px solid #dde3ec;
          font-size: 8px;
          white-space: nowrap;
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
          @page { size: landscape; margin: 10mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <div class="app-name">Theiarco</div>
          <div class="report-title">Pioneers Report</div>
        </div>
        <div class="header-right">
          <div class="date-label">${dateStr}</div>
          <div class="count-label">${pioneersData.length} pioneer${pioneersData.length !== 1 ? 's' : ''}</div>
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
          ${tableRows || '<tr><td colspan="17" style="text-align:center;padding:12px;color:#888;">No pioneer data available</td></tr>'}
        </tbody>
      </table>
      <div class="footer"><strong>Theiarco</strong> &bull; Pioneers Report &bull; ${dateStr}</div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  openPrintWindow(html, 'pioneers-report.pdf');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openPrintWindow(html: string, _filename: string): void {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    alert('Please allow pop-ups to export PDF.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
