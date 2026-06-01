# Times and overlaps

## Format

`startTime` / `endTime` are ISO strings, stored and compared as UTC (`Date.parse`).

## Intervals

A booking is `[start, end)` — start counts, end doesn’t.

So 10:00–11:00 and 11:00–12:00 on the same day are **not** a clash. Back-to-back is OK.

## Overlap check

```
newStart < existingEnd && newEnd > existingStart
```

Covers identical slots, partial overlap, and one slot inside another.

## UI

The form uses `datetime-local` (your local time). The browser sends UTC ISO to the API.

## Errors

- end before/equal start → 400
- clash → 409, `details.conflictingBookingIds` has the ids
