# Specification

## Summary
**Goal:** Make Elder and Ministerial Servant privilege badges use consistent, shared styling across the entire UI, with updated background colors.

**Planned changes:**
- Create a single shared implementation (component or helper) to render/style the “Elder” and “Ministerial Servant” privilege badges.
- Update all UI locations that currently render these privilege badges (including Publishers table, Publisher profile, Field Service Groups lists/profile lists, Pioneers table, and any other existing occurrences) to use the shared implementation.
- Change only the background colors for these two badges app-wide: Elder to #7C3AED and Ministerial Servant to #2563EB, keeping badge text white and keeping size/shape/typography unchanged.
- Ensure all other badges (statuses/roles like Available, Checked Out, On Track, Behind, Overseer, Assistant, Inactive, etc.) remain visually unchanged and that no dark-mode variants are introduced for these two badges.

**User-visible outcome:** Wherever an Elder or Ministerial Servant badge appears next to a publisher name, it is consistently styled and uses the new specified colors (Elder #7C3AED, Ministerial Servant #2563EB) with white text, while all other badges look the same as before.
