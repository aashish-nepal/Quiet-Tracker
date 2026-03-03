import { PlatformScraperAdapter } from './adapter.js';
import { fetchEtsyProduct } from '../services/platforms/etsyFetcher.js';

export const etsyScraper = new PlatformScraperAdapter(
  'etsy',
  (platform) => platform === 'etsy',
  fetchEtsyProduct
);
