# Specification

## Summary
**Goal:** Rename meeting type terminology across the attendance UI from “Weekday” to “Mid-week” while keeping weekend terminology unchanged and preserving historical data behavior.

**Planned changes:**
- Update the Record Attendance modal meeting type dropdown to show “Mid-week Meeting” (and save/submit the meetingType value as exactly “Mid-week Meeting”) while leaving “Weekend Meeting” unchanged.
- Change the attendance statistics summary label from “Average weekday attendance” to “Average mid-week attendance” without altering calculations or layout.
- Update meeting attendance record cards to display “Mid-week Meeting” wherever “Weekday Meeting” appears.
- Sweep the frontend for any remaining user-facing “Weekday” text and replace it with “Mid-week”, and ensure mid-week stats/filters/aggregations include both legacy “Weekday” records and new “Mid-week” records.

**User-visible outcome:** Users see “Mid-week” terminology everywhere in the attendance UI, and mid-week attendance statistics continue to include both older “Weekday” records and new “Mid-week” records.
