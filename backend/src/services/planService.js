import { query } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';

export const DEFAULT_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    product_limit: 2,
    check_interval_hours: 24,
    history_days: 7,
    allowed_channels: ['email']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    product_limit: 20,
    check_interval_hours: 12,
    history_days: 30,
    allowed_channels: ['email', 'slack', 'discord']
  }
};

function normalizePlan(row) {
  if (!row) return DEFAULT_PLANS.free;
  return {
    id: row.id,
    name: row.name,
    product_limit: row.product_limit,
    check_interval_hours: row.check_interval_hours,
    history_days: row.history_days,
    allowed_channels: row.allowed_channels || ['email']
  };
}

export async function getUserPlan(userId) {
  const sql = `
    SELECT p.*
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
    WHERE s.user_id = $1
      AND (
        s.status IN ('active', 'trialing')
        OR (s.status = 'past_due' AND (s.grace_period_ends_at IS NULL OR s.grace_period_ends_at > NOW()))
      )
    ORDER BY s.updated_at DESC
    LIMIT 1
  `;

  const result = await query(sql, [userId]);
  if (!result.rows[0]) {
    return DEFAULT_PLANS.free;
  }

  return normalizePlan(result.rows[0]);
}

export async function getUserSubscription(userId) {
  const result = await query(
    `SELECT
      s.plan_id,
      s.status,
      s.trial_ends_at,
      s.current_period_end,
      s.grace_period_ends_at,
      s.cancel_at_period_end,
      s.stripe_subscription_id,
      p.name AS plan_name
    FROM subscriptions s
    LEFT JOIN plans p ON p.id = s.plan_id
    WHERE s.user_id = $1
    ORDER BY s.updated_at DESC
    LIMIT 1`,
    [userId]
  );

  if (!result.rows[0]) {
    return {
      planId: 'free',
      planName: 'Free',
      subscriptionStatus: 'active',
      trialEndsAt: null,
      currentPeriodEnd: null,
      gracePeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null
    };
  }

  const row = result.rows[0];
  return {
    planId: row.plan_id,
    planName: row.plan_name || 'Free',
    subscriptionStatus: row.status,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    gracePeriodEndsAt: row.grace_period_ends_at,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    stripeSubscriptionId: row.stripe_subscription_id
  };
}

export async function getUserUsage(userId, organizationId = null) {
  const productsPromise = organizationId
    ? query(
        'SELECT COUNT(*)::int AS count, MIN(next_check_at) AS next_check_at FROM tracked_products WHERE organization_id = $1 AND is_active = true',
        [organizationId]
      )
    : query(
        'SELECT COUNT(*)::int AS count, MIN(next_check_at) AS next_check_at FROM tracked_products WHERE user_id = $1 AND is_active = true',
        [userId]
      );

  const [{ rows: products }, plan, subscription] = await Promise.all([
    productsPromise,
    getUserPlan(userId),
    getUserSubscription(userId)
  ]);

  return {
    activeProducts: products[0]?.count || 0,
    productLimit: plan.product_limit,
    checkIntervalHours: plan.check_interval_hours,
    historyDays: plan.history_days,
    allowedChannels: plan.allowed_channels,
    planId: plan.id,
    planName: plan.name,
    nextRefreshAt: products[0]?.next_check_at || null,
    subscriptionStatus: subscription.subscriptionStatus,
    trialEndsAt: subscription.trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
    gracePeriodEndsAt: subscription.gracePeriodEndsAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    stripeSubscriptionId: subscription.stripeSubscriptionId
  };
}

export async function assertProductWithinLimit(userId, organizationId = null) {
  const usage = await getUserUsage(userId, organizationId);
  if (usage.activeProducts >= usage.productLimit) {
    throw new HttpError(
      403,
      `Plan limit reached: ${usage.activeProducts}/${usage.productLimit} tracked products.`
    );
  }
}

export function channelAllowedForPlan(plan, channelType) {
  return plan.allowed_channels.includes(channelType);
}
