# Specification

## Summary
**Goal:** Add “LDC” and “Food Service” as new task category options throughout the Tasks UI and ensure the frontend builds successfully.

**Planned changes:**
- Add “LDC” and “Food Service” to the category dropdown options in the Add Task modal.
- Add “LDC” and “Food Service” to the category dropdown options in the Edit Task modal.
- Update any category filter dropdowns on the Tasks page (if present) to include “LDC” and “Food Service”, without altering existing options.
- Fix the current frontend build failure related to category typing/option definitions so TypeScript builds cleanly after the new categories are added.

**User-visible outcome:** Users can select “LDC” or “Food Service” when adding or editing a task (and in any category filters, if available), and the app builds and runs without errors.
