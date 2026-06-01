import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import * as bookingService from '../services/bookingService.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('owner', 'admin'));

router.get('/', (req, res) => {
  res.json({ success: true, data: bookingService.usageSummary() });
});

export default router;
