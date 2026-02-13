# Specification

## Summary
**Goal:** Add tri-state (none/asc/desc) single-column sorting to the Territories table without changing other page behaviors.

**Planned changes:**
- Make each Territories table column header clickable and cycle its sort state: default (no sort) → ascending → descending → default.
- Ensure only one column is actively sorted at a time; clicking a different header clears the previous sort and indicator.
- Add inline sort indicators (↑/↓) next to the active column label and add subtle hover affordance (pointer cursor + slight hover background) using Tailwind utility classes within the Territories page.
- Implement appropriate compare logic per column: Territory Number (numeric when parsable), Publisher (alphabetical by displayed value with '—' handled consistently), Status (alphabetical), Type (alphabetical), Checked Out Duration (numeric months with '—' handled consistently), and restore the original fetched order when returning to default.

**User-visible outcome:** Users can click any Territories table header to sort ascending/descending and click a third time to return to the original default row order, with a clear arrow indicator on the currently sorted column.
