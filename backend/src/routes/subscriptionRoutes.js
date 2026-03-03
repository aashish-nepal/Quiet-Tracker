import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import {
  changePlanWithProration,
  createBillingPortalSession,
  createCheckoutSession,
  syncFromCheckoutSession
} from '../services/stripeService.js';
import { getUserSubscription } from '../services/planService.js';

const router = Router();

router.get(
  '/current',
  requireUserId,
  asyncHandler(async (req, res) => {
    const subscription = await getUserSubscription(req.userId);
    res.json(subscription);
  })
);

router.post(
  '/checkout',
  requireUserId,
  asyncHandler(async (req, res) => {
    const { planId, billingInterval } = req.body || {};
    const session = await createCheckoutSession(req.userId, planId, billingInterval);
    res.json(session);
  })
);

router.post(
  '/portal',
  requireUserId,
  asyncHandler(async (req, res) => {
    const session = await createBillingPortalSession(req.userId);
    res.json(session);
  })
);

router.post(
  '/change-plan',
  requireUserId,
  asyncHandler(async (req, res) => {
    const { planId, billingInterval } = req.body || {};
    const result = await changePlanWithProration(req.userId, planId, billingInterval);
    res.json(result);
  })
);

router.post(
  '/sync-after-checkout',
  requireUserId,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body || {};
    const result = await syncFromCheckoutSession(sessionId);
    res.json(result);
  })
);

export default router;
