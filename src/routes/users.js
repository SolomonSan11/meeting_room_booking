import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserRoleSchema,
  userIdParamSchema,
} from '../validators/schemas.js';
import * as userService from '../services/userService.js';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res) => {
  res.json({ success: true, data: req.user });
});

router.get('/', requireRoles('admin'), (req, res) => {
  res.json({ success: true, data: userService.listAll() });
});

router.post('/', requireRoles('admin'), validate(createUserSchema), (req, res) => {
  const user = userService.create(req.validated.body);
  res.status(201).json({ success: true, data: user });
});

router.patch(
  '/:id/role',
  requireRoles('admin'),
  validate(updateUserRoleSchema),
  (req, res) => {
    const user = userService.updateRole(
      req.validated.params.id,
      req.validated.body.role,
      req.user
    );
    res.json({ success: true, data: user });
  }
);

router.delete(
  '/:id',
  requireRoles('admin'),
  validate(userIdParamSchema),
  (req, res) => {
    const result = userService.remove(req.validated.params.id, req.user);
    res.json({
      success: true,
      data: result,
      message: result.policy,
    });
  }
);

export default router;
