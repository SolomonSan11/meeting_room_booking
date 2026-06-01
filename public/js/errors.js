import { ApiError } from './api.js';

const CODE_FALLBACKS = {
  UNAUTHORIZED: 'Please select a user to continue.',
  FORBIDDEN: "You don't have permission to do that.",
  NOT_FOUND: 'We could not find what you asked for.',
  VALIDATION_ERROR: 'Please check the form and try again.',
  INTERNAL_ERROR: 'Something went wrong on our side. Try again in a moment.',
  ROUTE_NOT_FOUND: 'That page or action is not available.',
};

function looksTechnical(text) {
  if (!text) return true;
  const uuid =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  return (
    uuid.test(text) ||
    text.includes('X-User-Id') ||
    text.includes('ISO') ||
    text.includes('conflictingBookingIds')
  );
}

export function friendlyErrorMessage(err) {
  if (!(err instanceof ApiError)) {
    const msg = err?.message;
    if (msg && !looksTechnical(msg)) return msg;
    return 'Something went wrong. Please try again.';
  }

  if (err.code === 'VALIDATION_ERROR' && Array.isArray(err.details)) {
    const first = err.details.find((e) => e?.message);
    if (first?.message && !looksTechnical(first.message)) {
      return first.message;
    }
    return CODE_FALLBACKS.VALIDATION_ERROR;
  }

  if (err.message && !looksTechnical(err.message)) {
    return err.message;
  }

  if (err.code === 'CONFLICT' && err.details?.conflicts?.length) {
    const labels = err.details.conflicts
      .map((c) => c.label)
      .filter(Boolean);
    if (labels.length === 1) {
      return `The room is already booked: ${labels[0]}. Choose another time.`;
    }
    if (labels.length > 1) {
      return `That time overlaps ${labels.length} existing bookings. Try a different slot.`;
    }
  }

  return CODE_FALLBACKS[err.code] || CODE_FALLBACKS.INTERNAL_ERROR;
}
