# Specification

## Summary
**Goal:** Replace the `/conductors` placeholder with a real “Service Meeting Conductors” page and connect it to a new stable backend query (read-only list for now).

**Planned changes:**
- Frontend: Implement the “Service Meeting Conductors” page on `/conductors` using the standard app layout/styling, with a heading, an “Assign Conductor” button (#43587A background, white text) that is clickable but does nothing, and a table with columns “Week Of”, “Conductor Name”, and “Actions” (placeholder only).
- Frontend: Add React Query data fetching for conductor assignments, including a loading state that shows a spinner and the text “Loading...”, and an empty-state message exactly: “No conductors assigned. Click 'Assign Conductor' to create one.” when no assignments exist.
- Backend: Add a new stable-persisted Service Meeting Conductor assignments domain in the single Motoko actor (`backend/main.mo`) storing records with fields: `id` (Text), `weekOf` (Int; Monday timestamp in seconds), `conductorId` (Text), `conductorName` (Text), `createdAt` (Int).
- Both: Expose a backend query to list all conductor assignments via generated frontend bindings and render returned rows in the table (formatted “Week Of” date and “Conductor Name”).

**User-visible outcome:** Visiting `/conductors` shows a real “Service Meeting Conductors” page with an (inactive placeholder) “Assign Conductor” button, a loading state while fetching, and either an empty-state message or a read-only table populated from backend assignment records.
