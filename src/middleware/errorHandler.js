import { AppError } from '../utils/errors.js';
import { config } from '../config/index.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  if (err.name === 'ZodError') {
    const first = err.errors?.[0];
    const message =
      first?.message && typeof first.message === 'string'
        ? first.message
        : 'Please check the form and try again.';
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: err.errors,
      },
    });
  }

  console.error('[unhandled]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProduction
        ? 'Server error'
        : err.message,
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'That link or action is not available.',
    },
  });
}
