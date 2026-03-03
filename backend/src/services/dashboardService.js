import { query } from '../db/client.js';
import { getUserUsage } from './planService.js';

export async function getDashboard(userId, organizationId = null) {
  const usage = await getUserUsage(userId, organizationId);

  const scopeSql = organizationId ? 'tp.organization_id = $1' : 'tp.user_id = $1';
  const scopeArg = organizationId || userId;

  const result = await query(
    `SELECT
      tp.id,
      tp.product_title AS product,
      tp.store_name AS store,
      tp.platform,
      tp.url,
      tp.next_check_at,
      tp.last_checked_at,
      tp.threshold_pct,
      tp.alert_below_price,
      tp.own_price,
      tp.variant_key,
      tp.summary_mode,
      latest.price AS new_price,
      latest.price_usd AS new_price_usd,
      previous.price AS old_price,
      previous.price_usd AS old_price_usd,
      CASE
        WHEN previous.price IS NULL OR previous.price = 0 THEN NULL
        ELSE ((latest.price - previous.price) / previous.price) * 100
      END AS pct_change
    FROM tracked_products tp
    LEFT JOIN LATERAL (
      SELECT price, price_usd, captured_at
      FROM price_snapshots
      WHERE tracked_product_id = tp.id
      ORDER BY captured_at DESC
      LIMIT 1
    ) latest ON TRUE
    LEFT JOIN LATERAL (
      SELECT price, price_usd, captured_at
      FROM price_snapshots
      WHERE tracked_product_id = tp.id
      ORDER BY captured_at DESC
      OFFSET 1
      LIMIT 1
    ) previous ON TRUE
    WHERE ${scopeSql}
      AND tp.is_active = true
    ORDER BY tp.updated_at DESC`,
    [scopeArg]
  );

  const alertsResult = await query(
    `SELECT pa.*, tp.product_title, tp.store_name
     FROM price_alerts pa
     JOIN tracked_products tp ON tp.id = pa.tracked_product_id
     WHERE pa.user_id = $1 OR ($2::uuid IS NOT NULL AND tp.organization_id = $2)
     ORDER BY pa.created_at DESC
     LIMIT 20`,
    [userId, organizationId]
  );

  return {
    usage,
    products: result.rows,
    recentAlerts: alertsResult.rows
  };
}
