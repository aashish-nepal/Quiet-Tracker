import amazonPaapi from 'amazon-paapi';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/httpError.js';
import { extractAmazonAsin } from '../../utils/platformDetector.js';

export async function fetchAmazonProduct(url) {
  if (!env.amazonAccessKey || !env.amazonSecretKey || !env.amazonPartnerTag) {
    throw new HttpError(500, 'Amazon Product Advertising API credentials are not configured');
  }

  const asin = extractAmazonAsin(url);

  const response = await amazonPaapi.GetItems({
    AccessKey: env.amazonAccessKey,
    SecretKey: env.amazonSecretKey,
    PartnerTag: env.amazonPartnerTag,
    PartnerType: 'Associates',
    Marketplace: env.amazonMarketplace,
    ItemIds: [asin],
    Resources: [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message'
    ]
  });

  const item = response?.ItemsResult?.Items?.[0];
  if (!item) {
    throw new HttpError(404, 'Amazon item not found via Product Advertising API');
  }

  const listing = item?.Offers?.Listings?.[0];
  const amount = listing?.Price?.Amount;
  const currency = listing?.Price?.Currency || 'USD';

  return {
    platform: 'amazon',
    externalProductId: asin,
    title: item?.ItemInfo?.Title?.DisplayValue || 'Amazon Product',
    storeName: new URL(url).hostname,
    price: amount,
    currency,
    inStock: !String(listing?.Availability?.Message || '').toLowerCase().includes('out of stock')
  };
}
