import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey || !secretKey.startsWith('sk_')) {
  console.error('Missing or invalid STRIPE_SECRET_KEY');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const configs = [
  {
    planId: 'starter',
    productName: 'Quiet Tracker Starter',
    prices: [
      {
        amount: 2900,
        interval: 'month',
        lookupKey: 'quiet_tracker_starter_monthly',
        envVar: 'STRIPE_PRICE_STARTER'
      },
      {
        amount: 29000,
        interval: 'year',
        lookupKey: 'quiet_tracker_starter_yearly',
        envVar: 'STRIPE_PRICE_STARTER_YEARLY'
      }
    ]
  }
];

async function findOrCreateProduct({ planId, productName }) {
  const existing = await stripe.products.list({ limit: 100, active: true });
  const found = existing.data.find((p) => p.metadata?.planId === planId);
  if (found) return found;

  return stripe.products.create({
    name: productName,
    metadata: { planId }
  });
}

async function findOrCreateRecurringPrice({ productId, amount, lookupKey, planId, interval }) {
  const existing = await stripe.prices.list({ product: productId, limit: 100, active: true });
  const found = existing.data.find(
    (price) =>
      price.recurring?.interval === interval &&
      price.unit_amount === amount &&
      price.currency === 'usd'
  );

  if (found) return found;

  return stripe.prices.create({
    unit_amount: amount,
    currency: 'usd',
    recurring: { interval },
    product: productId,
    lookup_key: lookupKey,
    metadata: { planId }
  });
}

async function main() {
  const out = {};

  for (const cfg of configs) {
    const product = await findOrCreateProduct(cfg);
    const prices = {};

    for (const priceCfg of cfg.prices) {
      const price = await findOrCreateRecurringPrice({
        productId: product.id,
        amount: priceCfg.amount,
        lookupKey: priceCfg.lookupKey,
        planId: cfg.planId,
        interval: priceCfg.interval
      });
      prices[priceCfg.envVar] = price.id;
    }

    out[cfg.planId] = { productId: product.id, prices };
  }

  console.log('Stripe resources ready:');
  console.log(JSON.stringify(out, null, 2));
  console.log('Use these env vars:');
  console.log(`STRIPE_PRICE_STARTER=${out.starter.prices.STRIPE_PRICE_STARTER}`);
  console.log(`STRIPE_PRICE_STARTER_YEARLY=${out.starter.prices.STRIPE_PRICE_STARTER_YEARLY}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
