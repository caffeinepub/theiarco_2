// PDF export utility for Tasks page
// Uses jsPDF (loaded dynamically from CDN) to generate actual PDF files

import type { Task } from '../backend';
import { formatLongDate } from './formatters';

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

export async function exportTasksToPdf(tasks: Task[]): Promise<void> {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Tasks Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Theiarco  •  ${dateStr}  •  ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`, 14, 22);

  const head = [['Title', 'Due Date', 'Category', 'Status', 'Notes']];

  const body = tasks.map((task) => [
    task.title,
    formatLongDate(task.dueDate),
    task.category,
    task.isCompleted ? 'Completed' : 'Incomplete',
    task.notes ?? '—',
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    head,
    body,
    startY: 27,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 32 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 'auto' },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 3) {
        const status = data.row.raw[3];
        if (status === 'Completed') {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
      if (data.section === 'body' && data.column.index === 0) {
        const status = data.row.raw[3];
        if (status === 'Completed') {
          data.cell.styles.textColor = [150, 150, 150];
        }
      }
    },
  });

  doc.save('tasks-report.pdf');
}
