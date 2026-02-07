# Specification

## Summary
**Goal:** Add a shepherding-visit Profile page that can be opened from the Shepherding Visits list (by visit ID) and supports viewing details plus editing notes, editing the visit, and deleting the visit.

**Planned changes:**
- Update the Shepherding Visits list so the Publisher Name cell links to `/shepherding/<visit.id>` (visit ID-based routing).
- Add a new routed Visit Profile page at `/shepherding/$id` (TanStack Router) and register it in the app routing.
- Build the Visit Profile UI to show Publisher Name (heading), Visit Date (formatted like existing `formatVisitDate`), and Elders Present (single free-text string), with a `Back to Shepherding Visits` button and top-right `Edit` / `Delete` actions.
- Add a Notes section with a textarea bound to the visit’s `notes` field and a `Save Notes` button (background `#43587A`) that persists to the backend and shows a green toast: `Notes saved successfully!`.
- Implement Edit flow: `Edit` opens a pre-filled modal (Publisher dropdown required, Visit Date required, Elders Present required) with Save/Cancel; saving updates backend, refreshes profile data, and shows green toast `Visit updated successfully!`.
- Implement Delete flow: `Delete` opens confirmation dialog titled `Delete this visit?` with `Yes`/`Cancel`; `Yes` deletes in backend, navigates to `/shepherding`, and shows green toast `Visit deleted successfully!`.
- Add/ensure React Query hooks for: fetching a single visit by ID, updating a visit, deleting a visit, and saving notes; invalidate `['shepherdingVisits']` and the single-visit query on successful mutations (adding missing backend actor methods only if required, without changing the existing model fields).

**User-visible outcome:** Users can click a Publisher Name in the Shepherding Visits list to open a visit-specific profile page, view visit details, edit and save notes, edit visit fields via a modal, or delete the visit with confirmation and success toasts.
