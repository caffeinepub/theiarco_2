# Specification

## Summary
**Goal:** Add an authenticated Publisher Profile page that can be opened by publisher ID and reached from the Publishers list.

**Planned changes:**
- Add a new authenticated route `/publishers/:id` that renders inside the existing authenticated app layout.
- Update the Publishers table so each publisher name is clickable and navigates to `/publishers/<id>` without changing existing Edit/Delete actions.
- Build the Publisher Profile page UI to show the selected publisher’s details: full name (as heading), group number, overseer status (Yes/No), assistant status (Yes/No), and privileges.
- Add a “Back to Publishers” button on the profile page that navigates to `/publishers`.
- Fetch publisher data by ID on page load using the existing backend API, and display loading and “not found” states with a way back to `/publishers`.

**User-visible outcome:** Users can click a publisher’s name in the Publishers list to open a profile page at `/publishers/<id>`, view that publisher’s details, see clear loading/not-found messaging, and return to the Publishers list via a back button.
