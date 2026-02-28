# Specification

## Summary
**Goal:** Fix the PDF export utilities so they generate real PDF files instead of HTML files.

**Planned changes:**
- Rewrite `pioneersPdfExport.ts` to use jsPDF: import jsPDF and jspdf-autotable, create a jsPDF instance, add a title via `doc.text()`, add a pioneers table via `doc.autoTable()` (columns: Name, Service Year, Total Hours, Average Hours, Status), and save with `doc.save('pioneers-report.pdf')`
- Rewrite `tasksPdfExport.ts` to use jsPDF: same pattern with a tasks table (columns: Title, Due Date, Category, Status, Notes) saved as `tasks-report.pdf`
- Rewrite `notesPdfExport.ts` to use jsPDF: same pattern with notes content rendered via jsPDF methods, saved as `notes-report.pdf`
- Remove all HTML string generation and blob/anchor download logic from all three files

**User-visible outcome:** Clicking "Export to PDF" on the Pioneers, Tasks, and Notes pages now downloads a proper `.pdf` file that opens in a PDF viewer instead of an HTML file.
