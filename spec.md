# Specification

## Summary
**Goal:** Fix all three PDF export utilities to use only jsPDF built-in fonts, no external resource loading, and synchronous direct download — eliminating popup/window errors.

**Planned changes:**
- Rewrite `pioneersPdfExport.ts` to use jsPDF with built-in fonts (helvetica), generate PDF from in-memory data, trigger download via `save()`, and render a bordered table with monthly hours, totals, averages, and status per pioneer
- Rewrite `tasksPdfExport.ts` to use jsPDF with built-in fonts, no external assets, trigger download via `save()`, and render a bordered table with task title, due date, category, status, and notes
- Rewrite `notesPdfExport.ts` to use jsPDF with built-in fonts, no external assets, trigger download via `save()`, and render notes grouped by category with section headers
- Remove all `window.open()` calls, custom font loading, and external image/asset fetching from all three utilities

**User-visible outcome:** Clicking any PDF export button immediately downloads the PDF file without opening a new window, triggering popup blockers, or producing console errors.
