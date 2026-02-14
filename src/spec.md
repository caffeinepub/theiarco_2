# Specification

## Summary
**Goal:** Update the app’s UI to a new navy/slate/gold color palette by changing global theme variables and applying them consistently across navigation, buttons, dashboard stat cards, and status badges—without altering layout or functionality.

**Planned changes:**
- Update global theme/color variables in `frontend/src/index.css` (using the existing Tailwind/OKLCH CSS variable approach) to set: Primary #003057, Secondary #5B8FA3, Accent #F4A82E, Dark-background text #FFFFFF, Neutral gray #A8A9AD, and ensure old primary references render as the new navy.
- Update header/navigation styling to use the new primary navy background and ensure readable (white) text/icon contrast while keeping layout/behavior unchanged.
- Update sidebar active navigation item styling so the active background uses the new primary navy and active text/icons remain readable, with hover/inactive styles color-adjusted to fit the palette.
- Update primary button styling across the app to use the new primary navy, with hover/focus/active states adjusted to complementary palette shades (including secondary slate where appropriate), without changing button variants/sizes/behavior.
- Update dashboard stat card color styling to use navy/slate/gold combinations via existing stat card variables, preserving layout/typography/interactions and keeping non-stat alert colors semantically consistent (only harmonizing where controlled by theme variables).
- Adjust status badge green/red/orange shades to better complement the new palette while preserving meanings and ensuring readable contrast (including in light/dark themes where applicable).
- Verify/enforce readable contrast by updating relevant foreground variables (e.g., primary-foreground, secondary-foreground, accent-foreground, muted-foreground, and any brand-specific foreground usage) so text/icons remain legible after palette changes.

**User-visible outcome:** The app looks the same structurally, but now uses a cohesive navy/slate/gold theme across navigation, buttons, dashboard cards, and badges, with improved and consistent text/icon contrast.
