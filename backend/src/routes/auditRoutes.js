import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { query } from '../db/client.js';

const router = Router();

router.get(
  '/me',
  requireUserId,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT *
       FROM audit_logs
       WHERE organization_id = $1
       ORDER BY created_at DESC
       LIMIT 200`,
      [req.organizationId]
    );

    res.json(result.rows);
  })
);

export default router;
