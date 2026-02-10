# Specification

## Summary
**Goal:** Add a "Recent Activity" section to the Dashboard to show the latest shepherding visits.

**Planned changes:**
- Add a new "Recent Activity" heading directly below the existing four stat cards on the Dashboard.
- Use the existing shepherding visits query hook (useGetAllShepherdingVisits) to fetch visits, sort by visit date (newest first), and display up to 5 most recent items.
- For each displayed visit, render publisher name, the formatted visit date (using formatVisitDate), and a "View" link to `/shepherding/<visitId>`.
- Show muted/gray "No recent activity" text when there are no visits.
- Keep all other Dashboard UI and behavior unchanged.

**User-visible outcome:** The Dashboard shows a "Recent Activity" list of up to five most recent shepherding visits (with a link to view each visit), or a muted "No recent activity" message when none exist.
