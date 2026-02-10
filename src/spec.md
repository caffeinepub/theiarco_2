# Specification

## Summary
**Goal:** Add an Alerts section to the Dashboard, displayed directly below Recent Activity, to surface overdue territories and tasks with navigation links.

**Planned changes:**
- Update `frontend/src/pages/Dashboard.tsx` to render a new "Alerts" section directly below the "Recent Activity" section using existing Dashboard spacing/card styling patterns.
- Compute and display up to two alert items in the Alerts section:
  - Red alert: count of territories currently checked out for 4+ months, with text "X territories overdue for return" and a link to `/territories`.
  - Orange alert: count of overdue tasks (past `dueDate` and `isCompleted` is false), with text "X overdue tasks" and a link to `/tasks`.
- If neither alert condition applies, show muted gray text "No alerts" (no alert boxes).

**User-visible outcome:** The Dashboard shows an "Alerts" section under Recent Activity that either lists overdue territory/task alerts with links to the relevant pages or displays "No alerts" when everything is up to date.
