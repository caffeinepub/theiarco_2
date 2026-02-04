# Specification

## Summary
**Goal:** Add a Global Notes “Add Note” modal on /notes that creates and persists Global Notes in a new, separate backend store, with an optional publisher attachment only for the “Publishers” category.

**Planned changes:**
- Create a new backend Global Notes data model and stable storage that is fully separate from Publisher Profile Notes (separate IDs, storage, and APIs).
- Add backend APIs to create Global Notes with: generated unique ID, title, content, category, optional publisher reference (only when category is “Publishers”), and integer creation timestamp; validate payloads and persist across canister upgrades.
- Update /notes UI: implement “Add Note” modal with required Title, Content, Category dropdown (None, Publishers, Territory, Shepherding, Elder, General), and conditional “Attach To” dropdown behavior (Publishers enabled; Territory/Shepherding shown but disabled with specified placeholders; hidden otherwise).
- Populate “Attach To” for Publishers category using only active publishers (exclude inactive; update as publisher list refetches).
- Wire Submit/Cancel flows: Submit calls create API, closes modal, clears form, and shows a green toast “Note created successfully!” that auto-dismisses after 3 seconds; Cancel closes without saving.
- Enforce separation in UI and backend: Global Notes do not appear in Publisher Profile Notes, and Publisher Profile Notes do not appear on /notes.

**User-visible outcome:** On the Notes page, users can open an Add Note modal, optionally attach a note to an active publisher (Publishers category only), submit to save a new Global Note that persists over upgrades, and see a success toast—without affecting Publisher Profile Notes.
