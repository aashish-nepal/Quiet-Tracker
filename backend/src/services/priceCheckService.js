import { query, withTransaction } from '../db/client.js';
import { fetchProductByUrl } from '../scrapers/index.js';
import { getUserPlan } from './planService.js';
import { sendDailySummaryNotifications, sendPriceChangeNotifications } from './notificationService.js';
import { safePercentChange } from '../utils/price.js';
import { HttpError } from '../utils/httpError.js';
import { normalizePriceToUsd } from './currencyService.js';
import { captureProductScreenshot } from './screenshotService.js';
import { logAudit } from './auditLogService.js';
import { processGracePeriodDowngrades } from './stripeService.js';

async function getTrackedProductById(id) {
  const result = await query(
    `SELECT tp.*, u.email
     FROM tracked_products tp
     JOIN users u ON u.id = tp.user_id
     WHERE tp.id = $1 AND tp.is_active = true`,
    [id]
  );
  return result.rows[0] || null;
}

async function getLatestSnapshot(productId) {
  const result = await query(
    `SELECT *
     FROM price_snapshots
     WHERE tracked_product_id = $1
     ORDER BY captured_at DESC
     LIMIT 1`,
    [productId]
  );
  return result.rows[0] || null;
}

async function pruneHistory(productId, historyDays) {
  if (historyDays === null || historyDays === undefined) return;

  await query(
    `DELETE FROM price_snapshots
     WHERE tracked_product_id = $1
       AND captured_at < NOW() - ($2::text || ' days')::interval`,
    [productId, String(historyDays)]
  );
}

function evaluateAlertTypes({
  trackedProduct,
  previousPrice,
  previousPriceUsd,
  currentPrice,
  currentPriceUsd,
  pctChange
}) {
  const alerts = [];

  const threshold = Number(trackedProduct.threshold_pct || 1);
  const crossedThreshold = pctChange !== null && Math.abs(pctChange) >= threshold;
  if (crossedThreshold) {
    alerts.push('threshold');
  }

  const below = trackedProduct.alert_below_price !== null ? Number(trackedProduct.alert_below_price) : null;
  if (
    below !== null &&
    Number.isFinite(below) &&
    currentPrice <= below &&
    (previousPrice === null || previousPrice > below)
  ) {
    alerts.push('below_price');
  }

  const ownPrice = trackedProduct.own_price !== null ? Number(trackedProduct.own_price) : null;
  if (
    trackedProduct.undercut_enabled &&
    ownPrice !== null &&
    Number.isFinite(ownPrice) &&
    currentPriceUsd !== null &&
    currentPriceUsd < ownPrice &&
    (previousPriceUsd === null || previousPriceUsd >= ownPrice)
  ) {
    alerts.push('undercut');
  }

  return [...new Set(alerts)];
}

export async function checkProductNow(productId, actorUserId = null, organizationId = null) {
  const trackedProduct = await getTrackedProductById(productId);
  if (!trackedProduct) {
    throw new HttpError(404, 'Tracked product not found');
  }

  if (organizationId && trackedProduct.organization_id !== organizationId) {
    throw new HttpError(404, 'Tracked product not found');
  }

  const plan = await getUserPlan(trackedProduct.user_id);
  const fetched = await fetchProductByUrl(trackedProduct.url);
  const normalized = await normalizePriceToUsd({ amount: fetched.price, currency: fetched.currency });
  const latest = await getLatestSnapshot(productId);
  const previousPrice = latest ? Number(latest.price) : null;
  const previousPriceUsd =
    latest?.price_usd !== null && latest?.price_usd !== undefined
      ? Number(latest.price_usd)
      : previousPrice;
  const currentPrice = Number(fetched.price);

  const pctChange = previousPrice !== null ? safePercentChange(previousPrice, currentPrice) : null;
  const alertTypes = evaluateAlertTypes({
    trackedProduct,
    previousPrice,
    previousPriceUsd,
    currentPrice,
    currentPriceUsd: normalized.usdAmount,
    pctChange
  });

  const shouldCapture = alertTypes.length > 0 && Boolean(trackedProduct.screenshot_on_change);
  let screenshotPath = null;
  if (shouldCapture) {
    try {
      screenshotPath = await captureProductScreenshot({ productId, url: trackedProduct.url });
    } catch {
      screenshotPath = null;
    }
  }

  const result = await withTransaction(async (client) => {
    await client.query(
      `UPDATE tracked_products
       SET product_title = $2,
           store_name = $3,
           competitor_name = COALESCE(competitor_name, $3),
           currency = $4,
           platform = $5,
           variant_key = COALESCE($6, variant_key),
           external_product_id = COALESCE($7, external_product_id),
           last_price_usd = $8,
           last_checked_at = NOW(),
           next_check_at = NOW() + ($9::text || ' hours')::interval,
           last_error = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [
        productId,
        fetched.title,
        fetched.storeName,
        fetched.currency || trackedProduct.currency || 'USD',
        fetched.platform,
        fetched.variantKey || trackedProduct.variant_key,
        fetched.externalProductId,
        normalized.usdAmount,
        String(plan.check_interval_hours)
      ]
    );

    const snapshotInsert = await client.query(
      `INSERT INTO price_snapshots (
        tracked_product_id,
        price,
        original_price,
        original_currency,
        price_usd,
        variant_key,
        stock_status,
        is_out_of_stock,
        screenshot_path,
        captured_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        productId,
        currentPrice,
        normalized.originalAmount,
        normalized.originalCurrency,
        normalized.usdAmount,
        fetched.variantKey || trackedProduct.variant_key,
        fetched.inStock ? 'in_stock' : 'out_of_stock',
        !fetched.inStock,
        screenshotPath
      ]
    );

    const alertRows = [];
    for (const type of alertTypes) {
      const insert = await client.query(
        `INSERT INTO price_alerts (
          user_id,
          tracked_product_id,
          old_price,
          new_price,
          pct_change,
          alert_type,
          screenshot_path,
          summary_bucket_date,
          is_summary_pending,
          notified_channels,
          metadata,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_DATE,
          $8, $9, $10::jsonb, NOW()
        )
        RETURNING *`,
        [
          trackedProduct.user_id,
          productId,
          previousPrice,
          currentPrice,
          pctChange || 0,
          type,
          screenshotPath,
          trackedProduct.summary_mode === 'daily',
          plan.allowed_channels,
          JSON.stringify({
            ownPrice: trackedProduct.own_price,
            alertBelowPrice: trackedProduct.alert_below_price,
            variantKey: fetched.variantKey || trackedProduct.variant_key,
            priceUsd: normalized.usdAmount
          })
        ]
      );
      alertRows.push(insert.rows[0]);
    }

    return {
      snapshot: snapshotInsert.rows[0],
      alerts: alertRows
    };
  });

  await pruneHistory(productId, plan.history_days);

  if (result.alerts.length > 0 && trackedProduct.summary_mode !== 'daily') {
    for (const alert of result.alerts) {
      await sendPriceChangeNotifications({
        userId: trackedProduct.user_id,
        plan,
        product: trackedProduct,
        previousPrice,
        currentPrice,
        pctChange,
        alertType: alert.alert_type,
        screenshotPath,
        stockStatus: fetched.inStock ? 'in_stock' : 'out_of_stock'
      });

      await query('UPDATE price_alerts SET delivered_at = NOW(), is_summary_pending = false WHERE id = $1', [
        alert.id
      ]);
    }
  }

  if (actorUserId) {
    await logAudit({
      organizationId: trackedProduct.organization_id,
      userId: actorUserId,
      action: 'product.checked',
      entityType: 'tracked_product',
      entityId: productId,
      metadata: {
        currentPrice,
        previousPrice,
        alertTypes,
        summaryMode: trackedProduct.summary_mode
      }
    });
  }

  return {
    productId,
    previousPrice,
    currentPrice,
    pctChange,
    threshold: Number(trackedProduct.threshold_pct || 1),
    alertTriggered: alertTypes.length > 0,
    alertTypes,
    screenshotPath,
    snapshot: result.snapshot
  };
}

export async function processDailySummaryAlerts(limitUsers = 50) {
  const usersRes = await query(
    `SELECT DISTINCT pa.user_id
     FROM price_alerts pa
     WHERE pa.is_summary_pending = true
     ORDER BY pa.created_at ASC
     LIMIT $1`,
    [limitUsers]
  );

  let sentSummaries = 0;

  for (const user of usersRes.rows) {
    const alertsRes = await query(
      `SELECT pa.*, tp.product_title
       FROM price_alerts pa
       JOIN tracked_products tp ON tp.id = pa.tracked_product_id
       WHERE pa.user_id = $1
         AND pa.is_summary_pending = true
       ORDER BY pa.created_at ASC`,
      [user.user_id]
    );

    const alerts = alertsRes.rows;
    if (!alerts.length) continue;

    const plan = await getUserPlan(user.user_id);
    await sendDailySummaryNotifications({
      userId: user.user_id,
      plan,
      alerts
    });

    await query(
      `UPDATE price_alerts
       SET is_summary_pending = false,
           delivered_at = NOW()
       WHERE user_id = $1
         AND is_summary_pending = true`,
      [user.user_id]
    );

    sentSummaries += 1;
  }

  return {
    sentSummaries
  };
}

export async function checkDueProducts(limit = 100) {
  const due = await query(
    `SELECT tp.id
     FROM tracked_products tp
     LEFT JOIN LATERAL (
       SELECT s.plan_id
       FROM subscriptions s
       WHERE s.user_id = tp.user_id
         AND (
           s.status IN ('active', 'trialing')
           OR (s.status = 'past_due' AND (s.grace_period_ends_at IS NULL OR s.grace_period_ends_at > NOW()))
         )
       ORDER BY s.updated_at DESC
       LIMIT 1
     ) current_sub ON TRUE
     WHERE tp.is_active = true
       AND (tp.next_check_at IS NULL OR tp.next_check_at <= NOW())
     ORDER BY
       CASE WHEN COALESCE(current_sub.plan_id, 'free') = 'starter' THEN 0 ELSE 1 END,
       tp.next_check_at NULLS FIRST
     LIMIT $1`,
    [limit]
  );

  const results = [];
  for (const row of due.rows) {
    try {
      const check = await checkProductNow(row.id);
      results.push({ productId: row.id, status: 'ok', check });
    } catch (error) {
      await query('UPDATE tracked_products SET last_error = $2, last_checked_at = NOW() WHERE id = $1', [
        row.id,
        error.message
      ]);
      results.push({ productId: row.id, status: 'error', error: error.message });
    }
  }

  const grace = await processGracePeriodDowngrades();

  return {
    attempted: due.rows.length,
    results,
    grace
  };
}
