export function parseUtc(isoString) {
  const ms = Date.parse(isoString);
  if (Number.isNaN(ms)) {
    return null;
  }
  return ms;
}

export function assertValidRange(startTime, endTime) {
  const startMs = parseUtc(startTime);
  const endMs = parseUtc(endTime);

  if (startMs === null || endMs === null) {
    return { ok: false, error: 'Enter a valid start and end date/time.' };
  }

  if (startMs >= endMs) {
    return { ok: false, error: 'End time must be after start time.' };
  }

  return { ok: true, startMs, endMs };
}

// [start, end) — touching at the boundary is fine (10-11 then 11-12)
export function rangesOverlap(aStartMs, aEndMs, bStartMs, bEndMs) {
  return aStartMs < bEndMs && aEndMs > bStartMs;
}
