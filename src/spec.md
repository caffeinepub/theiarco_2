# Specification

## Summary
**Goal:** Correct the Territories “Checked Out Duration” calculation and ensure territory checkout timestamps are consistently stored/returned in epoch seconds.

**Planned changes:**
- Update the Territories page duration logic to compute elapsed time from the latest not-returned checkout date to today using backend timestamps in seconds, with defensive normalization for legacy/incorrect millisecond or nanosecond values.
- Adjust duration display formatting to show whole months when ≥ 1 month (“1 month”, “N months”) and whole days when < 1 month (“N days”), while keeping duration sorting based on the same underlying computed value.
- Enforce seconds-based timestamps in checkout create/edit flows by ensuring frontend sends seconds and backend normalizes any millisecond/nanosecond-like inputs to seconds before storing for checkOutTerritory and updateCheckoutRecord.

**User-visible outcome:** The Territories table shows accurate, realistically scaled checked-out durations (days or months), and newly created/edited checkout records no longer produce extreme duration values due to inconsistent timestamp units.
