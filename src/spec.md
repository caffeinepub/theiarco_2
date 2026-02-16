# Specification

## Summary
**Goal:** Add a new “Notes” overview stat card to the Dashboard, displayed alongside the existing “Meeting Attendance” stat card in a second row.

**Planned changes:**
- Update the Dashboard stat card grid layout so the first row shows 4 cards and the second row shows 2 cards side-by-side (Meeting Attendance + new Notes card) on supported screen sizes.
- Add a new “Notes” stat card matching existing stat card size and hover/click behavior, using a note/document icon, dark grey background (#374151 or #4B5563), and white text.
- Fetch global notes on the Dashboard via the existing global notes query hook, compute the total count (notes.length), and include this query’s loading state in the Dashboard loading gate.
- Make the Notes stat card navigate to the Notes page route (`/notes`) when clicked, using the same Link-based routing pattern as other stat cards.

**User-visible outcome:** The Dashboard shows a new Notes stat card in the second row next to Meeting Attendance; it displays the total global notes count (e.g., “12 notes”) and clicking it navigates to `/notes`.
