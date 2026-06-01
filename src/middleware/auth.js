import { unauthorized, forbidden, notFound } from '../utils/errors.js';
import * as userService from '../services/userService.js';

export function authenticate(req, res, next) {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(unauthorized());
  }

  const user = userService.findById(userId);
  if (!user) {
    return next(notFound('That user no longer exists. Pick another account.'));
  }

  req.user = user;
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden('Your role cannot do that.'));
    }
    next();
  };
}
