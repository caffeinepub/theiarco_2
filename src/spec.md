# Specification

## Summary
**Goal:** Update the existing “Overseer” and “Assistant” badge colors on the Field Service Groups list and profile pages without changing layout or introducing new components.

**Planned changes:**
- In `frontend/src/pages/FieldServiceGroupProfile.tsx`, change the existing “Overseer” badge styling to black background with white text, and the existing “Assistant” badge styling to gray background with white text, keeping all other badge styling the same.
- In `frontend/src/pages/FieldServiceGroups.tsx`, update any existing “Overseer”/“Assistant” badge-like UI elements to use the same black/white and gray/white color scheme, with no other styling changes.
- Ensure “Elder” and “Ministerial Servant” badge colors remain unchanged on both pages.

**User-visible outcome:** Overseer and Assistant labels in Field Service Groups pages display with the updated black/white and gray/white badge colors while all other badge styles remain the same.
