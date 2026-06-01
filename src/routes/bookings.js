import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  bookingIdParamSchema,
} from '../validators/schemas.js';
import * as bookingService from '../services/bookingService.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ success: true, data: bookingService.listAll() });
});

router.get(
  '/grouped-by-user',
  requireRoles('owner', 'admin'),
  (req, res) => {
    res.json({ success: true, data: bookingService.listGroupedByUser() });
  }
);

router.post('/', validate(createBookingSchema), (req, res) => {
  const booking = bookingService.create(req.validated.body, req.user);
  res.status(201).json({ success: true, data: booking });
});

router.delete('/:id', validate(bookingIdParamSchema), (req, res) => {
  const result = bookingService.remove(req.validated.params.id, req.user);
  res.json({ success: true, data: result });
});

export default router;
