import axios from 'axios';
import { load } from 'cheerio';
import { env } from '../../config/env.js';
import { HttpError } from '../../utils/httpError.js';
import { extractEtsyListingId } from '../../utils/platformDetector.js';
import { toNumber } from '../../utils/price.js';
import { fetchRenderedHtml } from './playwrightClient.js';

async function fetchFromEtsyApi(listingId) {
  if (!env.etsyApiKey) return null;

  const url = `https://openapi.etsy.com/v3/application/listings/${listingId}`;
  const { data } = await axios.get(url, {
    headers: {
      'x-api-key': env.etsyApiKey
    },
    timeout: 20000,
    validateStatus: (status) => status < 500
  });

  if (!data?.listing_id) return null;

  return {
    platform: 'etsy',
    externalProductId: String(data.listing_id),
    title: data.title,
    storeName: data.shop_name || 'Etsy',
    price: toNumber(data.price?.amount || data.price),
    currency: data.price?.currency_code || 'USD',
    inStock: data.quantity > 0
  };
}

function parseEtsyHtml(html, host, listingId) {
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
  const priceMeta = $('meta[property="product:price:amount"]').attr('content');
  const currencyMeta = $('meta[property="product:price:currency"]').attr('content') || 'USD';
  const inStock = !html.toLowerCase().includes('sold out');

  const regexPrice = html.match(/"price"\s*:\s*"([0-9]+(?:\.[0-9]+)?)"/i)?.[1];
  const price = toNumber(priceMeta) ?? toNumber(regexPrice);

  if (!price) return null;

  return {
    platform: 'etsy',
    externalProductId: listingId,
    title,
    storeName: host,
    price,
    currency: currencyMeta,
    inStock
  };
}

export async function fetchEtsyProduct(url) {
  const listingId = extractEtsyListingId(url);
  const apiData = await fetchFromEtsyApi(listingId);
  if (apiData?.price) {
    return apiData;
  }

  const parsed = new URL(url);
  const { data: html } = await axios.get(url, { timeout: 20000, responseType: 'text' });
  let product = parseEtsyHtml(html, parsed.hostname, listingId);

  if (!product) {
    const renderedHtml = await fetchRenderedHtml(url);
    product = parseEtsyHtml(renderedHtml, parsed.hostname, listingId);
  }

  if (!product) {
    throw new HttpError(404, 'Etsy product details unavailable');
  }

  return product;
}
