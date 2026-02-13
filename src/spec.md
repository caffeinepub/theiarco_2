# Specification

## Summary
**Goal:** Show a single, persistent global “reconnecting” toast when canister calls are pending or fail due to “Actor not available”, and automatically dismiss it once the backend actor reconnects.

**Planned changes:**
- Add global logic that detects when at least one React Query query/mutation is in-flight while the backend actor is not available, and display a top-right Sonner toast that stays visible until reconnection.
- Detect React Query failures whose error message includes "Actor not available" and trigger the same persistent reconnect toast.
- Ensure the reconnect toast never duplicates (single stable toast id) and auto-dismisses when the actor becomes available again, without breaking existing success/error toasts.

**User-visible outcome:** When the app loses actor connectivity during pending or failing canister calls, users see one persistent “Reconnecting…” toast that disappears automatically once the actor is available again.
