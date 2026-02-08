# Specification

## Summary
**Goal:** Replace the Service Meeting Conductors placeholder with a full CRUD system (backend + UI) for managing trained conductors.

**Planned changes:**
- Align the backend ServiceMeetingConductor domain model to: `{ id: Text, publisherId: Text, publisherName: Text, trainingDate: Int (seconds), status: Text ("Available" | "Unavailable"), createdAt: Int }`, including status validation.
- Add backend CRUD APIs (create, list all, get by id if needed, update by id, delete by id) with existing permission checks and createdAt/id handling rules.
- Add conditional migration support so upgrades initialize the new conductor collection without breaking existing canister state.
- Build the /conductors page UI: header + “Add Conductor” button, a table of conductors, and per-row Edit/Delete actions wired to backend.
- Implement a single Add/Edit modal with fields: Publisher dropdown (from existing publishers query), Training Date picker (seconds-based timestamp), Status dropdown (“Available”/“Unavailable”), with mode-specific titles and edit prefill.
- Update the conductors table columns/behavior: Conductor Name (default alphabetical order), Training Date (format “MMM d, yyyy”), Status (green/red badge), Actions (Edit/Delete).
- Add a delete confirmation dialog that asks exactly: “Delete this conductor?” before calling delete.
- Add React Query mutations (create/update/delete) and invalidate/refetch `['serviceMeetingConductors']` after successful mutations; show English loading/empty/success/error messaging.

**User-visible outcome:** Users can view all service meeting conductors at `/conductors`, add new conductors, edit existing entries via a modal, and delete entries with confirmation, with the table updating automatically after changes.
