export class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = 'We could not find what you asked for.') {
  return new AppError(404, 'NOT_FOUND', message);
}

export function forbidden(message = "You don't have permission to do that.") {
  return new AppError(403, 'FORBIDDEN', message);
}

export function badRequest(message, details = null) {
  return new AppError(400, 'BAD_REQUEST', message, details);
}

export function conflict(message, details = null) {
  return new AppError(409, 'CONFLICT', message, details);
}

export function unauthorized(message = 'Please select a user to continue.') {
  return new AppError(401, 'UNAUTHORIZED', message);
}
