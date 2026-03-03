import { PlatformScraperAdapter } from './adapter.js';
import { fetchAmazonProduct } from '../services/platforms/amazonFetcher.js';

export const amazonScraper = new PlatformScraperAdapter(
  'amazon',
  (platform) => platform === 'amazon',
  fetchAmazonProduct
);
