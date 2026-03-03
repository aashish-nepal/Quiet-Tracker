import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireCronSecret } from '../middleware/requireCronSecret.js';
import { checkDueProducts, processDailySummaryAlerts } from '../services/priceCheckService.js';

const router = Router();

router.post(
  '/run-scheduled-checks',
  requireCronSecret,
  asyncHandler(async (req, res) => {
    const limit = Number(req.body?.limit || 100);
    const runSummaries = Boolean(req.body?.runSummaries ?? true);
    const result = await checkDueProducts(limit);
    const summaries = runSummaries ? await processDailySummaryAlerts(100) : { sentSummaries: 0 };
    res.json({ ...result, summaries });
  })
);

router.post(
  '/run-daily-summaries',
  requireCronSecret,
  asyncHandler(async (_req, res) => {
    const result = await processDailySummaryAlerts(200);
    res.json(result);
  })
);

export default router;
