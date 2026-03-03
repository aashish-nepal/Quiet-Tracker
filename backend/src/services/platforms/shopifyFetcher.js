import axios from 'axios';
import { HttpError } from '../../utils/httpError.js';
import { extractShopifyHandle } from '../../utils/platformDetector.js';
import { toNumber } from '../../utils/price.js';

/**
 * Detect the currency used by a Shopify store.
 * Priority: variant.presentment_price currency → /meta.json money_with_currency_format → USD fallback.
 */
async function detectShopifyCurrency(origin, variants) {
  // 1. Try presentment prices on the first variant (most reliable)
  const firstVariant = variants[0];
  if (firstVariant?.presentment_prices?.length) {
    const code = firstVariant.presentment_prices[0]?.price?.currency_code;
    if (code) return code;
  }

  // 2. Try /meta.json which Shopify exposes publicly
  try {
    const { data } = await axios.get(`${origin}/meta.json`, {
      timeout: 8000,
      validateStatus: (s) => s < 500
    });
    // money_format contains a symbol like "$", money_with_currency_format contains "$ USD"
    const fmt = data?.shop?.money_with_currency_format || '';
    const match = fmt.match(/([A-Z]{3})/);
    if (match) return match[1];
  } catch {
    // ignore — fall through to default
  }

  return 'USD';
}

export async function fetchShopifyProduct(url) {
  const parsed = new URL(url);
  const handle = extractShopifyHandle(url);
  const apiUrl = `${parsed.origin}/products/${handle}.json`;

  const { data } = await axios.get(apiUrl, {
    timeout: 20000,
    validateStatus: (status) => status < 500
  });

  if (!data?.product) {
    throw new HttpError(404, 'Shopify product JSON not found');
  }

  const variants = data.product.variants || [];
  const prices = variants.map((variant) => toNumber(variant.price)).filter((n) => n !== null);
  const available = variants.some((variant) => Boolean(variant.available));
  const currency = await detectShopifyCurrency(parsed.origin, variants);

  return {
    platform: 'shopify',
    externalProductId: String(data.product.id),
    title: data.product.title,
    storeName: parsed.hostname,
    price: prices.length ? Math.min(...prices) : null,
    currency,
    inStock: available
  };
}
