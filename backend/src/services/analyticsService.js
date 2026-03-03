import { query } from '../db/client.js';

export async function getPricingIntelligence({ userId, organizationId }) {
  const params = [organizationId || null, userId];

  const trends = await query(
    `SELECT
      tp.id AS tracked_product_id,
      tp.product_title,
      tp.store_name,
      DATE(ps.captured_at) AS day,
      AVG(COALESCE(ps.price_usd, ps.price))::numeric(12,4) AS avg_price_usd,
      MIN(COALESCE(ps.price_usd, ps.price))::numeric(12,4) AS min_price_usd,
      MAX(COALESCE(ps.price_usd, ps.price))::numeric(12,4) AS max_price_usd
     FROM tracked_products tp
     JOIN price_snapshots ps ON ps.tracked_product_id = tp.id
     WHERE (tp.organization_id = $1 OR (tp.organization_id IS NULL AND tp.user_id = $2))
       AND ps.captured_at >= NOW() - INTERVAL '30 days'
       AND tp.is_active = true
     GROUP BY tp.id, tp.product_title, tp.store_name, DATE(ps.captured_at)
     ORDER BY day ASC`,
    params
  );

  const aggressive = await query(
    `SELECT
      COALESCE(tp.product_group, tp.product_title, tp.external_product_id, tp.id::text) AS group_key,
      tp.store_name,
      AVG(COALESCE(ps.price_usd, ps.price))::numeric(12,4) AS avg_price_usd,
      COUNT(*)::int AS datapoints
     FROM tracked_products tp
     JOIN price_snapshots ps ON ps.tracked_product_id = tp.id
     WHERE (tp.organization_id = $1 OR (tp.organization_id IS NULL AND tp.user_id = $2))
       AND ps.captured_at >= NOW() - INTERVAL '30 days'
       AND tp.is_active = true
     GROUP BY group_key, tp.store_name
     ORDER BY avg_price_usd ASC
     LIMIT 20`,
    params
  );

  const cheaperPct = await query(
    `SELECT
      tp.id AS tracked_product_id,
      tp.product_title,
      tp.store_name,
      ROUND(
        100.0 * AVG(CASE WHEN tp.own_price IS NOT NULL AND COALESCE(ps.price_usd, ps.price) < tp.own_price THEN 1 ELSE 0 END),
        2
      ) AS pct_time_cheaper
     FROM tracked_products tp
     JOIN price_snapshots ps ON ps.tracked_product_id = tp.id
     WHERE (tp.organization_id = $1 OR (tp.organization_id IS NULL AND tp.user_id = $2))
       AND ps.captured_at >= NOW() - INTERVAL '30 days'
       AND tp.is_active = true
     GROUP BY tp.id, tp.product_title, tp.store_name
     ORDER BY pct_time_cheaper DESC NULLS LAST`,
    params
  );

  const volatility = await query(
    `SELECT
      tp.id AS tracked_product_id,
      tp.product_title,
      tp.store_name,
      ROUND(
        (STDDEV_POP(COALESCE(ps.price_usd, ps.price)) / NULLIF(AVG(COALESCE(ps.price_usd, ps.price)), 0)) * 100,
        2
      ) AS volatility_score
     FROM tracked_products tp
     JOIN price_snapshots ps ON ps.tracked_product_id = tp.id
     WHERE (tp.organization_id = $1 OR (tp.organization_id IS NULL AND tp.user_id = $2))
       AND ps.captured_at >= NOW() - INTERVAL '30 days'
       AND tp.is_active = true
     GROUP BY tp.id, tp.product_title, tp.store_name
     ORDER BY volatility_score DESC NULLS LAST`,
    params
  );

  return {
    trends: trends.rows,
    mostAggressiveCompetitors: aggressive.rows,
    cheaperTimeShare: cheaperPct.rows,
    volatility: volatility.rows
  };
}
