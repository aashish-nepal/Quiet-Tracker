import { PlatformScraperAdapter } from './adapter.js';
import { fetchShopifyProduct } from '../services/platforms/shopifyFetcher.js';

export const shopifyScraper = new PlatformScraperAdapter(
  'shopify',
  (platform) => platform === 'shopify',
  fetchShopifyProduct
);
