// PDF export utility for Notes page
// Generates HTML report and downloads directly without opening a new window

import type { GlobalNote } from '../backend';
import { formatNoteDate } from './formatters';

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
        <div class="category-heading">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-count">${categoryNotes.length} note${categoryNotes.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="notes-grid">
          ${noteCards}
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Notes Report</title>
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
      margin-bottom: 20px;
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
    .category-section {
      margin-bottom: 20px;
    }
    .category-heading {
      font-size: 11px;
      font-weight: 700;
      background-color: #333;
      color: #fff;
      padding: 5px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .category-name {
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }
    .category-count {
      font-size: 9px;
      font-weight: 400;
      color: #ccc;
    }
    .notes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .note-card {
      border: 1px solid #ccc;
      padding: 8px 10px;
      background: #fff;
      break-inside: avoid;
    }
    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5px;
      gap: 8px;
    }
    .note-title {
      font-size: 10px;
      font-weight: 700;
      color: #000;
      flex: 1;
    }
    .note-date {
      font-size: 8px;
      color: #777;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .note-content {
      font-size: 9px;
      color: #333;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .footer {
      margin-top: 20px;
      font-size: 8px;
      color: #555;
      text-align: right;
      border-top: 1px solid #ccc;
      padding-top: 6px;
    }
    @media print {
      body { padding: 10px; }
      @page { size: portrait; margin: 10mm; }
      .category-section { break-inside: avoid; }
      .note-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="report-title">Notes Report</div>
      <div style="font-size:9px;color:#333;margin-top:2px;">Theiarco</div>
    </div>
    <div class="report-meta">
      <div>${dateStr}</div>
      <div>${notes.length} note${notes.length !== 1 ? 's' : ''} &bull; ${orderedCategories.length} categor${orderedCategories.length !== 1 ? 'ies' : 'y'}</div>
    </div>
  </div>
  ${categorySections || '<p style="color:#555;text-align:center;padding:20px;">No notes available</p>'}
  <div class="footer">Theiarco &bull; Notes Report &bull; ${dateStr}</div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  downloadBlob(html, 'notes-report.html', 'text/html');
}
