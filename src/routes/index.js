import { Router } from 'express';
import usersRouter from './users.js';
import bookingsRouter from './bookings.js';
import summaryRouter from './summary.js';
import * as userService from '../services/userService.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/auth/users', (_req, res) => {
  res.json({ success: true, data: userService.listAll() });
});

router.use('/users', usersRouter);
router.use('/bookings', bookingsRouter);
router.use('/summary', summaryRouter);

export default router;
