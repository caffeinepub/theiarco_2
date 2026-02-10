# Specification

## Summary
**Goal:** Enhance the existing /dashboard page by adding a top-row overview of four statistic cards populated from existing publishers, territories, and tasks data.

**Planned changes:**
- Update the existing Dashboard page at `/dashboard` to render exactly four statistic cards in a single top row (with responsive stacking on smaller screens), leaving the rest of the page/layout unchanged.
- Fetch publishers, territories, and tasks via existing frontend actor/query hooks (no new backend endpoints) and compute counts for: Active Publishers, Checked Out Territories, Upcoming Tasks, and Overdue Tasks.
- Implement runtime client-side Unix timestamp (seconds) comparison logic for task `dueDate` (Int seconds), including safe conversion if `dueDate` arrives as a bigint-like type.
- Ensure routing/navigation supports accessing the Dashboard at `/dashboard`, including a working sidebar link, without breaking existing routes.

**User-visible outcome:** Visiting `/dashboard` shows four colored stat cards at the top—Active Publishers (green), Checked Out Territories (blue), Upcoming Tasks (orange), and Overdue Tasks (red)—each displaying the correct computed count, with existing navigation and other pages unchanged.
