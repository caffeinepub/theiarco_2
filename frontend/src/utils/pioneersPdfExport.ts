// PDF export utility for Pioneers page
// Uses jsPDF (loaded dynamically from CDN) to generate actual PDF files

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

export async function exportPioneersToPdf(pioneersData: PioneerPdfData[]): Promise<void> {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Pioneers Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Theiarco  •  ${dateStr}  •  ${pioneersData.length} pioneer${pioneersData.length !== 1 ? 's' : ''}`, 14, 22);

  const head = [
    ['Name', 'Service Year', 'Total Hrs', 'Avg Hrs', 'Status', ...SERVICE_YEAR_MONTHS.map((m) => m.substring(0, 3))],
  ];

  const body = pioneersData.map((pioneer) => {
    const monthCells = SERVICE_YEAR_MONTHS.map((month) => {
      const hours = pioneer.monthlyHours[month];
      return hours !== undefined ? String(hours) : '—';
    });
    return [
      pioneer.pioneerName,
      pioneer.serviceYear,
      String(pioneer.totalHours),
      pioneer.averageHours.toFixed(1),
      pioneer.currentStatus,
      ...monthCells,
    ];
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    head,
    body,
    startY: 27,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 18 },
      2: { cellWidth: 14 },
      3: { cellWidth: 13 },
      4: { cellWidth: 16 },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 4) {
        const status = data.row.raw[4];
        if (status === 'On Track') {
          data.cell.styles.textColor = [22, 163, 74];
        } else if (status === 'Behind') {
          data.cell.styles.textColor = [220, 38, 38];
        } else {
          data.cell.styles.textColor = [107, 114, 128];
        }
      }
    },
  });

  doc.save('pioneers-report.pdf');
}
