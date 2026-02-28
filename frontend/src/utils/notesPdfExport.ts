// PDF export utility for Notes page
// Uses jsPDF (loaded dynamically from CDN) to generate actual PDF files

import type { GlobalNote } from '../backend';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function formatNoteDate(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const CATEGORY_ORDER = [
  'General', 'Publishers', 'Territories', 'Service',
  'LDC', 'Food Service', 'Personal', 'Family', 'Other',
];

export async function exportNotesToPdf(notes: GlobalNote[]): Promise<void> {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Notes Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Theiarco  •  ${dateStr}  •  ${notes.length} note${notes.length !== 1 ? 's' : ''}`, 14, 22);

  // Group notes by category
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

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  if (orderedCategories.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No notes available', 14, 35);
    doc.save('notes-report.pdf');
    return;
  }

  let currentY = 27;

  for (const category of orderedCategories) {
    const categoryNotes = grouped[category];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      head: [[`${category}  (${categoryNotes.length} note${categoryNotes.length !== 1 ? 's' : ''})`]],
      body: categoryNotes.map((note) => [
        `${note.title}\n${formatNoteDate(note.createdAt)}\n\n${note.content}`,
      ]),
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 0: { cellWidth: 'auto' } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 6;

    if (currentY > 270) {
      doc.addPage();
      currentY = 14;
    }
  }

  doc.save('notes-report.pdf');
}
