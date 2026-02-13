# Specification

## Summary
**Goal:** Add a “Publisher” column to the Territories table that displays the publisher from the territory’s most recent checkout, without changing any other Territories page behavior.

**Planned changes:**
- Update the Territories table column order in `frontend/src/pages/Territories.tsx` to insert a new “Publisher” column between “Territory Number” and “Status”.
- Use `useGetAllPublishers` from `frontend/src/hooks/useQueries.ts` within `Territories.tsx` to support consistent publisher name display.
- For each territory row, compute the most recent checkout record by `dateCheckedOut` and display:
  - Publisher name when status is “Checked Out” (prefer checkout record publisher name; otherwise resolve via publishers list by publisher ID when available).
  - A muted/gray em dash (“—”) when status is “Available”, and also as a graceful fallback when checked out but no checkout record/name can be resolved.
- Ensure the new column fits the existing table layout without overflow at typical viewport sizes.

**User-visible outcome:** The Territories table includes a new “Publisher” column (between Territory Number and Status) showing who currently has a territory checked out, or a muted “—” when it’s available.
