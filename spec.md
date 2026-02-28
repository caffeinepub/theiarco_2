# Specification

## Summary
**Goal:** Add "Export to PDF" functionality to the Pioneers, Tasks, and Notes pages, generating downloadable PDF files using a client-side library (e.g., jsPDF with jsPDF-AutoTable).

**Planned changes:**
- Update `pioneersPdfExport.ts` to generate and download `pioneers-report.pdf` with a branded header (Theiarco, report title, current date), a table with columns for Name, Service Year, Total Hours, Average Hours, Current Status, and Monthly Hours, using #43587A for header/accent colors and landscape orientation
- Update `tasksPdfExport.ts` to generate and download `tasks-report.pdf` with a branded header and a table with columns for Title, Due Date, Category, Status, and Notes; completed tasks shown with strikethrough styling
- Update `notesPdfExport.ts` to generate and download `notes-report.pdf` with a branded header and notes grouped by category (category headers in #43587A), each showing title, content, and creation date
- Add an "Export to PDF" button to the Pioneers page top-right action area (next to "Export to CSV" and "Add Pioneer"), wired to `exportPioneersToPdf`
- Add an "Export to PDF" button to the Tasks page top-right action area (next to "Export to CSV" and "Add Task"), wired to `exportTasksToPdf`
- Add an "Export to PDF" button to the Notes page top-right action area (next to "Add Note"), wired to `exportNotesToPdf`
- All PDFs use black text on white background and are downloaded automatically without a manual rename step

**User-visible outcome:** Users can click "Export to PDF" on the Pioneers, Tasks, and Notes pages to instantly download a professionally formatted PDF report of the current data.
