import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboard } from '../services/dashboardService.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

router.get(
  '/me',
  requireUserId,
  asyncHandler(async (req, res) => {
    const data = await getDashboard(req.userId, req.organizationId);
    res.json(data);
  })
);

router.get(
  '/:userId',
  requireUserId,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.userId) {
      throw new HttpError(403, 'Cannot view another user dashboard');
    }
    const data = await getDashboard(req.userId, req.organizationId);
    res.json(data);
  })
);

export default router;
