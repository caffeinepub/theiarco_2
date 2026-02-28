// PDF export utility for Notes page
// Uses browser print API to generate a styled PDF organized by category

import type { GlobalNote } from '../backend';
import { formatNoteDate } from './formatters';

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

const CATEGORY_ORDER = [
  'General',
  'Publishers',
  'Territories',
  'Service',
  'LDC',
  'Food Service',
  'Personal',
  'Family',
  'Other',
];

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    General: '#6b7280',
    Publishers: '#2563eb',
    Territories: '#7c3aed',
    Service: '#059669',
    LDC: '#d97706',
    'Food Service': '#dc2626',
    Personal: '#0891b2',
    Family: '#be185d',
    Other: '#374151',
  };
  return colors[category] ?? '#374151';
}

export function exportNotesToPdf(notes: GlobalNote[]): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Group notes by category, sorted newest first within each group
  const grouped: Record<string, GlobalNote[]> = {};
  notes.forEach((note) => {
    const cat = note.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(note);
  });

  // Sort notes within each category by date (newest first)
  Object.keys(grouped).forEach((cat) => {
    grouped[cat].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  });

  // Order categories
  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const categorySections = orderedCategories.map((category) => {
    const categoryNotes = grouped[category];
    const color = getCategoryColor(category);

    const noteCards = categoryNotes.map((note) => `
      <div class="note-card">
        <div class="note-header">
          <span class="note-title">${escapeHtml(note.title)}</span>
          <span class="note-date">${escapeHtml(formatNoteDate(note.createdAt))}</span>
        </div>
        <div class="note-content">${escapeHtml(note.content)}</div>
      </div>
    `).join('');

    return `
      <div class="category-section">
        <div class="category-heading" style="background-color: #43587A; border-left-color: ${color};">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-count">${categoryNotes.length} note${categoryNotes.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="notes-grid">
          ${noteCards}
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Notes Report – Theiarco</title>
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
          margin-bottom: 20px;
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
        .category-section {
          margin-bottom: 20px;
          break-inside: avoid;
        }
        .category-heading {
          font-size: 12px;
          font-weight: 700;
          border-left: 5px solid #43587A;
          padding: 6px 10px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          border-radius: 0 4px 4px 0;
        }
        .category-name {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .category-count {
          font-size: 9px;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
        }
        .notes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .note-card {
          border: 1px solid #dde3ec;
          border-radius: 6px;
          padding: 10px 12px;
          background: #fff;
          break-inside: avoid;
        }
        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
          gap: 8px;
        }
        .note-title {
          font-size: 11px;
          font-weight: 700;
          color: #111;
          flex: 1;
        }
        .note-date {
          font-size: 9px;
          color: #9ca3af;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .note-content {
          font-size: 10px;
          color: #374151;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .footer {
          margin-top: 20px;
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
          .category-section { break-inside: avoid; }
          .note-card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <div class="app-name">Theiarco</div>
          <div class="report-title">Notes Report</div>
        </div>
        <div class="header-right">
          <div class="date-label">${dateStr}</div>
          <div class="count-label">${notes.length} note${notes.length !== 1 ? 's' : ''} &bull; ${orderedCategories.length} categor${orderedCategories.length !== 1 ? 'ies' : 'y'}</div>
        </div>
      </div>
      ${categorySections || '<p style="color:#888;text-align:center;padding:24px;">No notes available</p>'}
      <div class="footer"><strong>Theiarco</strong> &bull; Notes Report &bull; ${dateStr}</div>
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
