export function formatBookingRange(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateOpts = { dateStyle: 'medium', timeStyle: 'short' };
  const timeOpts = { timeStyle: 'short' };

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    const date = start.toLocaleString(undefined, { dateStyle: 'medium' });
    const t1 = start.toLocaleString(undefined, timeOpts);
    const t2 = end.toLocaleString(undefined, timeOpts);
    return `${date}, ${t1} – ${t2}`;
  }

  return `${start.toLocaleString(undefined, dateOpts)} – ${end.toLocaleString(undefined, dateOpts)}`;
}
