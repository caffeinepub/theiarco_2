# Specification

## Summary
**Goal:** Add a client-side CSV export action to the Pioneers page.

**Planned changes:**
- Add an "Export to CSV" button to the Pioneers page header, positioned top-right next to the existing "Add Pioneer" button, without affecting other pages.
- Implement client-side CSV generation and download as `pioneers-export.csv`, exporting all pioneers in the list with the required columns and correct calculations/labels matching the current UI logic.
- Style the "Export to CSV" button to match the existing "Add Pioneer" button’s general styling while visually differentiating it (e.g., secondary treatment and/or download icon), leaving the rest of the UI unchanged.

**User-visible outcome:** On the Pioneers page, users can click "Export to CSV" to download `pioneers-export.csv` containing all pioneers and their service-year hours/status data in the specified column order.
