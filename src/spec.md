# Specification

## Summary
**Goal:** Show how long territories have been checked out (in months) on the Territories list and visually flag long checkouts.

**Planned changes:**
- Add a new "Checked Out Duration" column to the Territories list table immediately after the existing "Status" column.
- For rows with status exactly "Checked Out", compute months checked out from the active checkout record (most recent checkOutHistory item with dateReturned = null) and display as "[X] months"; show "—" if no active record exists.
- For rows with status exactly "Available" or exactly "Under Review", display "—" in the duration column.
- Apply a subtle light red background to the full table row only when status is exactly "Checked Out" and computed months is 4 or more.

**User-visible outcome:** The Territories list shows a "Checked Out Duration" value for checked-out territories and highlights rows that have been checked out for 4+ months, without changing existing table behavior.
