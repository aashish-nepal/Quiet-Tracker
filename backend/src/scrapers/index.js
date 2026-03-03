import { detectPlatform } from '../utils/platformDetector.js';
import { HttpError } from '../utils/httpError.js';
import { extractVariantKeyFromUrl } from './adapter.js';
import { amazonScraper } from './amazon.js';
import { etsyScraper } from './etsy.js';
import { shopifyScraper } from './shopify.js';
import { woocommerceScraper } from './woocommerce.js';

const adapters = [shopifyScraper, woocommerceScraper, amazonScraper, etsyScraper];

export async function fetchProductByUrl(url) {
  const platform = detectPlatform(url);
  const adapter = adapters.find((candidate) => candidate.matches(platform, url));
  if (!adapter) {
    throw new HttpError(400, `Unsupported platform for URL: ${url}`);
  }

  const data = await adapter.fetch(url);
  if (data?.price === null || data?.price === undefined) {
    throw new HttpError(422, 'Unable to extract product price from target URL');
  }

  return {
    ...data,
    platform,
    variantKey: data.variantKey || extractVariantKeyFromUrl(url)
  };
}

export function listSupportedPlatforms() {
  return adapters.map((adapter) => adapter.name);
}
