import Stripe from 'stripe';
import { env } from '../config/env.js';
import { query } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

const PRICE_TO_PLAN = new Map(
  [env.stripePriceStarter, env.stripePriceStarterYearly].filter(Boolean).map((priceId) => [priceId, 'starter'])
);

function normalizeBillingInterval(interval) {
  return interval === 'yearly' ? 'yearly' : 'monthly';
}

function getPriceId(planId, billingInterval = 'monthly') {
  if (planId !== 'starter') return null;
  if (billingInterval === 'yearly') return env.stripePriceStarterYearly;
  if (billingInterval === 'monthly') return env.stripePriceStarter;
  return null;
}

function toDate(unixTs) {
  return unixTs ? new Date(unixTs * 1000) : null;
}

async function getUserById(userId) {
  const userRes = await query('SELECT id, email, stripe_customer_id FROM users WHERE id = $1', [userId]);
  return userRes.rows[0] || null;
}

async function getUserIdByStripeRefs({ customerId, subscriptionId }) {
  const byCustomer = customerId
    ? await query('SELECT id FROM users WHERE stripe_customer_id = $1 LIMIT 1', [customerId])
    : { rows: [] };

  if (byCustomer.rows[0]?.id) {
    return byCustomer.rows[0].id;
  }

  const bySubscription = subscriptionId
    ? await query('SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1', [subscriptionId])
    : { rows: [] };

  return bySubscription.rows[0]?.user_id || null;
}

async function shouldApplyTrial(userId) {
  if (!env.stripeTrialDays || env.stripeTrialDays <= 0) {
    return false;
  }

  const result = await query(
    `SELECT COUNT(*)::int AS count
     FROM subscriptions
     WHERE user_id = $1
       AND stripe_subscription_id IS NOT NULL`,
    [userId]
  );

  return (result.rows[0]?.count || 0) === 0;
}

export async function createCheckoutSession(userId, planId, billingInterval = 'monthly') {
  if (!stripe) {
    throw new HttpError(500, 'Stripe is not configured');
  }

  const normalizedInterval = normalizeBillingInterval(billingInterval);
  const priceId = getPriceId(planId, normalizedInterval);
  if (!priceId) {
    if (planId === 'starter' && normalizedInterval === 'yearly') {
      throw new HttpError(400, 'Yearly Starter billing is not configured');
    }
    throw new HttpError(400, 'Only starter plan can be purchased');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId } });
    customerId = customer.id;
    await query('UPDATE users SET stripe_customer_id = $2 WHERE id = $1', [userId, customerId]);
  }

  const trialEligible = await shouldApplyTrial(userId);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: env.stripeSuccessUrl || `${env.frontendBaseUrl}/billing/success`,
    cancel_url: env.stripeCancelUrl || `${env.frontendBaseUrl}/billing/cancel`,
    metadata: {
      userId,
      planId,
      billingInterval: normalizedInterval
    },
    subscription_data: {
      trial_period_days: trialEligible ? env.stripeTrialDays : undefined,
      metadata: {
        userId
      }
    }
  });

  return { url: session.url, id: session.id };
}

export async function createBillingPortalSession(userId) {
  if (!stripe) {
    throw new HttpError(500, 'Stripe is not configured');
  }

  const result = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [userId]);
  const customerId = result.rows[0]?.stripe_customer_id;

  if (!customerId) {
    throw new HttpError(400, 'No Stripe customer attached to this account');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.frontendBaseUrl}/billing`
  });

  return { url: session.url };
}

async function upsertSubscription({
  userId,
  stripeSubscriptionId,
  stripePriceId,
  status,
  trialEndsAt,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  gracePeriodEndsAt
}) {
  const planId = PRICE_TO_PLAN.get(stripePriceId) || 'free';

  await query(
    `INSERT INTO subscriptions (
      user_id,
      plan_id,
      stripe_subscription_id,
      stripe_price_id,
      status,
      trial_ends_at,
      current_period_end,
      grace_period_ends_at,
      cancel_at_period_end,
      updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      plan_id = EXCLUDED.plan_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      status = EXCLUDED.status,
      trial_ends_at = EXCLUDED.trial_ends_at,
      current_period_end = EXCLUDED.current_period_end,
      grace_period_ends_at = EXCLUDED.grace_period_ends_at,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = NOW()`,
    [
      userId,
      planId,
      stripeSubscriptionId,
      stripePriceId,
      status,
      trialEndsAt,
      currentPeriodEnd,
      gracePeriodEndsAt,
      cancelAtPeriodEnd
    ]
  );
}

async function syncSubscriptionFromStripeObject(
  userId,
  subscription,
  overrideStatus = null,
  gracePeriodEndsAt = null
) {
  if (!userId || !subscription) return;

  await upsertSubscription({
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price?.id,
    status: overrideStatus || subscription.status,
    trialEndsAt: toDate(subscription.trial_end),
    currentPeriodEnd: toDate(subscription.current_period_end),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    gracePeriodEndsAt
  });
}

async function syncFromInvoice(invoice, overrideStatus = null, setGracePeriod = false) {
  if (!stripe) return;

  const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  const userId = await getUserIdByStripeRefs({ customerId, subscriptionId });
  if (!userId || !subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const gracePeriodEndsAt = setGracePeriod
    ? new Date(Date.now() + env.stripeGraceDays * 24 * 60 * 60 * 1000)
    : null;
  await syncSubscriptionFromStripeObject(userId, subscription, overrideStatus, gracePeriodEndsAt);
}

async function getCurrentSubscriptionForUser(userId) {
  const result = await query(
    `SELECT stripe_subscription_id
     FROM subscriptions
     WHERE user_id = $1
       AND stripe_subscription_id IS NOT NULL
       AND status IN ('active', 'trialing', 'past_due')
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0]?.stripe_subscription_id || null;
}

async function recordWebhookEvent(eventId, eventType) {
  try {
    const result = await query(
      `INSERT INTO stripe_webhook_events (event_id, event_type, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId, eventType]
    );

    return result.rowCount > 0;
  } catch (error) {
    // Schema may be older in some environments; don't block billing sync.
    if (error?.code === '42P01') {
      return true;
    }
    throw error;
  }
}

export async function handleStripeWebhook(rawBody, signature) {
  if (!stripe || !env.stripeWebhookSecret) {
    throw new HttpError(500, 'Stripe webhook is not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  } catch (error) {
    throw new HttpError(400, `Webhook signature verification failed: ${error.message}`);
  }

  const isNewEvent = await recordWebhookEvent(event.id, event.type);
  if (!isNewEvent) {
    return { received: true, deduped: true, type: event.type };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userIdFromMeta = session?.metadata?.userId;
      const customerId = typeof session.customer === 'string' ? session.customer : null;
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;

      const userId =
        userIdFromMeta ||
        (await getUserIdByStripeRefs({ customerId, subscriptionId }));

      if (!userId || !subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionFromStripeObject(userId, subscription);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
      const userId = await getUserIdByStripeRefs({ customerId, subscriptionId: subscription.id });
      await syncSubscriptionFromStripeObject(userId, subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
      const userId = await getUserIdByStripeRefs({ customerId, subscriptionId: subscription.id });
      if (!userId) break;

      await query(
        `UPDATE subscriptions
         SET plan_id = 'free',
             status = 'canceled',
             grace_period_ends_at = NULL,
             cancel_at_period_end = true,
             current_period_end = $2,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, toDate(subscription.current_period_end)]
      );
      break;
    }

    case 'invoice.payment_succeeded':
    case 'invoice.paid': {
      await syncFromInvoice(event.data.object, 'active', false);
      break;
    }

    case 'invoice.payment_failed': {
      await syncFromInvoice(event.data.object, 'past_due', true);
      break;
    }

    default:
      break;
  }

  return { received: true, type: event.type };
}

export async function changePlanWithProration(userId, targetPlanId, billingInterval = 'monthly') {
  if (!stripe) {
    throw new HttpError(500, 'Stripe is not configured');
  }

  const normalizedInterval = normalizeBillingInterval(billingInterval);
  const targetPriceId = getPriceId(targetPlanId, normalizedInterval);
  if (!targetPriceId) {
    if (targetPlanId === 'starter' && normalizedInterval === 'yearly') {
      throw new HttpError(400, 'Yearly Starter billing is not configured');
    }
    throw new HttpError(400, 'Only starter plan can be selected');
  }

  const subscriptionId = await getCurrentSubscriptionForUser(userId);
  if (!subscriptionId) {
    return createCheckoutSession(userId, targetPlanId, normalizedInterval);
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;

  if (!itemId) {
    throw new HttpError(400, 'Subscription item not found for proration update');
  }

  const updated = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'create_prorations',
    items: [{ id: itemId, price: targetPriceId }]
  });

  await syncSubscriptionFromStripeObject(userId, updated, updated.status, null);

  return {
    updated: true,
    subscriptionId: updated.id,
    planId: PRICE_TO_PLAN.get(targetPriceId) || 'free',
    billingInterval: normalizedInterval
  };
}

export async function syncFromCheckoutSession(sessionId) {
  if (!stripe) {
    throw new HttpError(500, 'Stripe is not configured');
  }

  if (!sessionId || !sessionId.startsWith('cs_')) {
    throw new HttpError(400, 'Invalid session ID');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription']
  });

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    throw new HttpError(400, 'Checkout session is not completed');
  }

  const userIdFromMeta = session?.metadata?.userId;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const subscription =
    session.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null;
  const subscriptionId =
    subscription?.id ||
    (typeof session.subscription === 'string' ? session.subscription : null);

  const userId =
    userIdFromMeta || (await getUserIdByStripeRefs({ customerId, subscriptionId }));

  if (!userId) {
    throw new HttpError(404, 'Could not resolve user from checkout session');
  }

  const sub = subscription || (subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null);
  if (sub) {
    await syncSubscriptionFromStripeObject(userId, sub);
  }

  return { synced: true, userId, planId: PRICE_TO_PLAN.get(sub?.items?.data[0]?.price?.id) || 'starter' };
}

export async function processGracePeriodDowngrades() {
  const result = await query(
    `UPDATE subscriptions
     SET plan_id = 'free',
         status = 'canceled',
         grace_period_ends_at = NULL,
         updated_at = NOW()
     WHERE status = 'past_due'
       AND grace_period_ends_at IS NOT NULL
       AND grace_period_ends_at <= NOW()
     RETURNING user_id`
  );

  return {
    downgradedUsers: result.rowCount || 0
  };
}
