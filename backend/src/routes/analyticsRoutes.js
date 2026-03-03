import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { HttpError } from '../utils/httpError.js';
import { getPricingIntelligence } from '../services/analyticsService.js';

const router = Router();

router.get(
  '/me',
  requireUserId,
  asyncHandler(async (req, res) => {
    const intelligence = await getPricingIntelligence({
      userId: req.userId,
      organizationId: req.organizationId
    });

    res.json(intelligence);
  })
);

router.get(
  '/:userId',
  requireUserId,
  asyncHandler(async (req, res) => {
    if (req.params.userId !== req.userId) {
      throw new HttpError(403, 'Cannot view another user analytics');
    }

    const intelligence = await getPricingIntelligence({
      userId: req.userId,
      organizationId: req.organizationId
    });

    res.json(intelligence);
  })
);

export default router;
