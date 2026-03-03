import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { query } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';

const router = Router();

/**
 * Validate that a webhook URL targets an approved provider.
 * This prevents SSRF — a user cannot store an internal URL that the server
 * would later POST sensitive alert data to.
 */
function validateWebhookTarget(type, target) {
  if (typeof target !== 'string' || target.length === 0) {
    throw new HttpError(400, 'Webhook target URL is required');
  }
  if (target.length > 500) {
    throw new HttpError(400, 'Webhook URL is too long');
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    throw new HttpError(400, 'Webhook target must be a valid URL');
  }

  if (!['https:'].includes(parsed.protocol)) {
    throw new HttpError(400, 'Webhook URL must use HTTPS');
  }

  if (type === 'slack' && parsed.hostname !== 'hooks.slack.com') {
    throw new HttpError(400, 'Slack webhook URL must be from hooks.slack.com');
  }

  if (type === 'discord' && parsed.hostname !== 'discord.com') {
    throw new HttpError(400, 'Discord webhook URL must be from discord.com');
  }

  if (type === 'discord' && !parsed.pathname.startsWith('/api/webhooks/')) {
    throw new HttpError(400, 'Invalid Discord webhook URL format');
  }
}

router.get(
  '/channels',
  requireUserId,
  asyncHandler(async (req, res) => {
    const result = await query('SELECT id, type, target, is_enabled FROM notification_channels WHERE user_id = $1', [
      req.userId
    ]);
    res.json(result.rows);
  })
);

router.post(
  '/channels',
  requireUserId,
  asyncHandler(async (req, res) => {
    const { type, target, isEnabled = true } = req.body;
    if (!['email', 'slack', 'discord'].includes(type)) {
      throw new HttpError(400, 'Invalid channel type. Must be email, slack, or discord.');
    }

    // Validate webhook targets for non-email channels to prevent SSRF
    if (type !== 'email') {
      validateWebhookTarget(type, target);
    }

    const result = await query(
      `INSERT INTO notification_channels (user_id, type, target, is_enabled, created_at, updated_at)
       VALUES ($1,$2,$3,$4,NOW(),NOW())
       ON CONFLICT (user_id, type, target)
       DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = NOW()
       RETURNING id, type, target, is_enabled`,
      [req.userId, type, target, isEnabled]
    );

    res.status(201).json(result.rows[0]);
  })
);

export default router;

