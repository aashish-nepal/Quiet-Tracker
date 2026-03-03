import { PlatformScraperAdapter } from './adapter.js';
import { fetchWooProduct } from '../services/platforms/woocommerceFetcher.js';

export const woocommerceScraper = new PlatformScraperAdapter(
  'woocommerce',
  (platform) => platform === 'woocommerce',
  fetchWooProduct
);
