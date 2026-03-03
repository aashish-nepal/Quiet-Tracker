import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerUser } from '../services/userService.js';
import { getUserUsage } from '../services/planService.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const result = await registerUser(req.body || {});
    res.status(201).json(result);
  })
);

router.get(
  '/me/plan',
  requireUserId,
  asyncHandler(async (req, res) => {
    const usage = await getUserUsage(req.userId, req.organizationId);
    res.json(usage);
  })
);

router.get(
  '/:userId/plan',
  requireUserId,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.userId) {
      throw new HttpError(403, 'Cannot view another user plan');
    }
    const usage = await getUserUsage(req.userId, req.organizationId);
    res.json(usage);
  })
);

export default router;
