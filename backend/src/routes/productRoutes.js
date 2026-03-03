import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { manualCheckRateLimiter } from '../middleware/rateLimiters.js';
import { query, withTransaction } from '../db/client.js';
import { fetchProductByUrl } from '../scrapers/index.js';
import { assertProductWithinLimit, getUserPlan } from '../services/planService.js';
import { checkProductNow } from '../services/priceCheckService.js';
import { HttpError } from '../utils/httpError.js';
import { normalizePriceToUsd } from '../services/currencyService.js';
import { logAudit } from '../services/auditLogService.js';

const router = Router();

function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toSlug(value, fallback = 'price-history') {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

router.get(
  '/',
  requireUserId,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const [rows, countResult] = await Promise.all([
      query(
        `SELECT *
         FROM tracked_products
         WHERE organization_id = $1
           AND is_active = true
         ORDER BY updated_at DESC
         LIMIT $2 OFFSET $3`,
        [req.organizationId, limit, offset]
      ),
      query(
        `SELECT COUNT(*)::int AS total
         FROM tracked_products
         WHERE organization_id = $1
           AND is_active = true`,
        [req.organizationId]
      )
    ]);

    res.json({
      products: rows.rows,
      total: countResult.rows[0]?.total ?? 0,
      limit,
      offset
    });
  })
);

router.post(
  '/',
  requireUserId,
  asyncHandler(async (req, res) => {
    const {
      url,
      thresholdPct,
      alertBelowPrice,
      ownPrice,
      summaryMode = 'immediate',
      productGroup,
      competitorName,
      variantKey,
      undercutEnabled = false,
      screenshotOnChange = true
    } = req.body || {};

    if (!url) {
      throw new HttpError(400, 'url is required');
    }

    // H2: Validate URL is a real http/https URL before hitting the scraper
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new HttpError(400, 'url must be a valid URL');
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new HttpError(400, 'url must use http or https protocol');
    }

    const threshold = thresholdPct === undefined ? 1 : Number(thresholdPct);
    if (Number.isNaN(threshold) || threshold < 1 || threshold > 50) {
      throw new HttpError(400, 'thresholdPct must be between 1 and 50');
    }

    if (!['immediate', 'daily'].includes(summaryMode)) {
      throw new HttpError(400, 'summaryMode must be immediate or daily');
    }

    await assertProductWithinLimit(req.userId, req.organizationId);

    const fetched = await fetchProductByUrl(url);
    const normalized = await normalizePriceToUsd({
      amount: fetched.price,
      currency: fetched.currency
    });
    const plan = await getUserPlan(req.userId);

    const created = await withTransaction(async (client) => {
      const duplicate = await client.query(
        `SELECT id
         FROM tracked_products
         WHERE organization_id = $1
           AND url = $2
           AND is_active = true
         LIMIT 1`,
        [req.organizationId, url]
      );
      if (duplicate.rows[0]) {
        throw new HttpError(409, 'Product URL is already being tracked');
      }

      const productInsert = await client.query(
        `INSERT INTO tracked_products (
          organization_id,
          user_id,
          added_by_user_id,
          url,
          platform,
          store_name,
          competitor_name,
          external_product_id,
          product_title,
          product_group,
          variant_key,
          currency,
          base_currency,
          last_price_usd,
          threshold_pct,
          alert_below_price,
          own_price,
          undercut_enabled,
          summary_mode,
          screenshot_on_change,
          is_active,
          created_at,
          updated_at,
          last_checked_at,
          next_check_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'USD',$13,$14,$15,$16,$17,$18,$19,
          true,NOW(),NOW(),NOW(),NOW() + ($20::text || ' hours')::interval
        )
        RETURNING *`,
        [
          req.organizationId,
          req.userId,
          req.userId,
          url,
          fetched.platform,
          fetched.storeName,
          competitorName || fetched.storeName,
          fetched.externalProductId,
          fetched.title,
          productGroup || fetched.externalProductId || fetched.title,
          variantKey || fetched.variantKey || null,
          fetched.currency || 'USD',
          normalized.usdAmount,
          threshold,
          alertBelowPrice || null,
          ownPrice || null,
          Boolean(undercutEnabled),
          summaryMode,
          Boolean(screenshotOnChange),
          String(plan.check_interval_hours)
        ]
      );

      await client.query(
        `INSERT INTO price_snapshots (
          tracked_product_id,
          price,
          original_price,
          original_currency,
          price_usd,
          variant_key,
          stock_status,
          is_out_of_stock,
          captured_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [
          productInsert.rows[0].id,
          fetched.price,
          normalized.originalAmount,
          normalized.originalCurrency,
          normalized.usdAmount,
          productInsert.rows[0].variant_key,
          fetched.inStock ? 'in_stock' : 'out_of_stock',
          !fetched.inStock
        ]
      );

      return productInsert.rows[0];
    });

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'product.added',
      entityType: 'tracked_product',
      entityId: created.id,
      metadata: {
        url,
        platform: created.platform,
        summaryMode: created.summary_mode,
        thresholdPct: created.threshold_pct
      }
    });

    res.status(201).json(created);
  })
);

router.patch(
  '/:productId',
  requireUserId,
  asyncHandler(async (req, res) => {
    const updates = [];
    const values = [req.params.productId, req.organizationId];

    const allowed = {
      thresholdPct: 'threshold_pct',
      alertBelowPrice: 'alert_below_price',
      ownPrice: 'own_price',
      summaryMode: 'summary_mode',
      productGroup: 'product_group',
      competitorName: 'competitor_name',
      variantKey: 'variant_key',
      undercutEnabled: 'undercut_enabled',
      screenshotOnChange: 'screenshot_on_change'
    };

    // H3: Validate thresholdPct range on PATCH just like on POST
    if (req.body?.thresholdPct !== undefined) {
      const t = Number(req.body.thresholdPct);
      if (Number.isNaN(t) || t < 1 || t > 50) {
        throw new HttpError(400, 'thresholdPct must be between 1 and 50');
      }
    }

    for (const [inputKey, column] of Object.entries(allowed)) {
      if (req.body?.[inputKey] !== undefined) {
        values.push(req.body[inputKey]);
        updates.push(`${column} = $${values.length}`);
      }
    }

    if (updates.length === 0) {
      throw new HttpError(400, 'No mutable fields provided');
    }

    values.push(req.userId);
    updates.push(`updated_at = NOW()`);

    const sql = `
      UPDATE tracked_products
      SET ${updates.join(', ')}
      WHERE id = $1
        AND organization_id = $2
        AND is_active = true
      RETURNING *
    `;

    const result = await query(sql, values);
    if (!result.rows[0]) {
      throw new HttpError(404, 'Product not found');
    }

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'product.updated',
      entityType: 'tracked_product',
      entityId: req.params.productId,
      metadata: req.body || {}
    });

    res.json(result.rows[0]);
  })
);

router.delete(
  '/:productId',
  requireUserId,
  asyncHandler(async (req, res) => {
    const result = await query(
      `UPDATE tracked_products
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND organization_id = $2
       RETURNING id`,
      [req.params.productId, req.organizationId]
    );

    if (!result.rows[0]) {
      throw new HttpError(404, 'Product not found');
    }

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'product.removed',
      entityType: 'tracked_product',
      entityId: result.rows[0].id
    });

    res.json({ deleted: true, id: result.rows[0].id });
  })
);

router.post(
  '/:productId/check',
  requireUserId,
  manualCheckRateLimiter,
  asyncHandler(async (req, res) => {
    const owner = await query(
      'SELECT organization_id FROM tracked_products WHERE id = $1 AND is_active = true',
      [req.params.productId]
    );
    if (!owner.rows[0] || owner.rows[0].organization_id !== req.organizationId) {
      throw new HttpError(404, 'Product not found');
    }

    const result = await checkProductNow(req.params.productId, req.userId, req.organizationId);
    res.json(result);
  })
);

router.get(
  '/:productId/history/csv',
  requireUserId,
  asyncHandler(async (req, res) => {
    const plan = await getUserPlan(req.userId);
    if (plan.id !== 'starter') {
      // C3: Message now correctly communicates that Starter plan is required
      throw new HttpError(403, 'CSV history export requires a Starter plan. Please upgrade.');
    }

    const productRes = await query(
      `SELECT id, product_title
       FROM tracked_products
       WHERE id = $1
         AND organization_id = $2
         AND is_active = true
       LIMIT 1`,
      [req.params.productId, req.organizationId]
    );

    const product = productRes.rows[0];
    if (!product) {
      throw new HttpError(404, 'Product not found');
    }

    const historyRes = await query(
      `WITH ordered AS (
        SELECT
          ps.captured_at,
          ps.price,
          ps.price_usd,
          ps.original_price,
          ps.original_currency,
          ps.stock_status,
          LAG(ps.price) OVER (ORDER BY ps.captured_at ASC) AS prev_price
        FROM price_snapshots ps
        WHERE ps.tracked_product_id = $1
          AND ps.captured_at >= NOW() - ($2::text || ' days')::interval
      )
      SELECT
        captured_at,
        price,
        price_usd,
        original_price,
        original_currency,
        stock_status,
        CASE
          WHEN prev_price IS NULL OR prev_price = 0 THEN NULL
          ELSE ((price - prev_price) / prev_price) * 100
        END AS pct_change
      FROM ordered
      ORDER BY captured_at DESC`,
      [req.params.productId, String(plan.history_days || 30)]
    );

    const header = [
      'captured_at_utc',
      'price',
      'price_usd',
      'pct_change',
      'original_price',
      'original_currency',
      'stock_status'
    ];

    const lines = [header.join(',')];
    for (const row of historyRes.rows) {
      lines.push(
        [
          row.captured_at ? new Date(row.captured_at).toISOString() : '',
          row.price,
          row.price_usd,
          row.pct_change !== null && row.pct_change !== undefined ? Number(row.pct_change).toFixed(2) : '',
          row.original_price,
          row.original_currency,
          row.stock_status
        ]
          .map(escapeCsvValue)
          .join(',')
      );
    }

    const filename = `${toSlug(product.product_title)}-history.csv`;
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('cache-control', 'no-store');
    res.status(200).send(lines.join('\n'));
  })
);

export default router;
