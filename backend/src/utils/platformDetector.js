import { HttpError } from './httpError.js';

const AMAZON_HOSTS = ['amazon.com', 'amazon.ca', 'amazon.co.uk', 'amazon.de', 'amazon.in'];

export function normalizeProductUrl(url) {
  try {
    return new URL(url).toString();
  } catch {
    throw new HttpError(400, 'Invalid URL format');
  }
}

export function detectPlatform(url) {
  const parsed = new URL(normalizeProductUrl(url));
  const host = parsed.hostname.replace(/^www\./, '');
  const path = parsed.pathname;

  if (host.includes('etsy.com')) return 'etsy';
  if (AMAZON_HOSTS.some((domain) => host.includes(domain))) return 'amazon';
  if (path.includes('/products/')) return 'shopify';

  // WooCommerce stores are custom domains; use WordPress/Woo hints.
  if (path.includes('/product/') || path.includes('/shop/') || path.includes('/wp-content/')) {
    return 'woocommerce';
  }

  // Last resort heuristics.
  if (host.includes('myshopify.com')) return 'shopify';

  throw new HttpError(400, 'Unsupported URL. Supported platforms: Shopify, WooCommerce, Amazon, Etsy.');
}

export function extractShopifyHandle(url) {
  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/products\/([^/?#]+)/i);
  if (!match?.[1]) {
    throw new HttpError(400, 'Cannot detect Shopify product handle from URL');
  }
  return decodeURIComponent(match[1]);
}

export function extractWooSlug(url) {
  const parsed = new URL(url);
  const cleaned = parsed.pathname.replace(/\/$/, '');
  const slug = cleaned.split('/').filter(Boolean).pop();
  if (!slug) {
    throw new HttpError(400, 'Cannot detect WooCommerce product slug from URL');
  }
  return decodeURIComponent(slug);
}

export function extractAmazonAsin(url) {
  const parsed = new URL(url);
  const patterns = [/\/dp\/([A-Z0-9]{10})/i, /\/gp\/product\/([A-Z0-9]{10})/i];
  for (const pattern of patterns) {
    const match = parsed.pathname.match(pattern);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }
  throw new HttpError(400, 'Cannot detect Amazon ASIN from URL');
}

export function extractEtsyListingId(url) {
  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/listing\/([0-9]+)/i);
  if (!match?.[1]) {
    throw new HttpError(400, 'Cannot detect Etsy listing ID from URL');
  }
  return match[1];
}
