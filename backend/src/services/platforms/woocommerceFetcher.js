import axios from 'axios';
import { load } from 'cheerio';
import { HttpError } from '../../utils/httpError.js';
import { extractWooSlug } from '../../utils/platformDetector.js';
import { toNumber } from '../../utils/price.js';
import { fetchRenderedHtml } from './playwrightClient.js';

async function fetchFromStoreApi(url, slug) {
  const parsed = new URL(url);
  const apiUrl = `${parsed.origin}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}`;
  const { data } = await axios.get(apiUrl, {
    timeout: 20000,
    validateStatus: (status) => status < 500
  });

  const product = Array.isArray(data) ? data[0] : null;
  if (!product) return null;

  const rawPrice = product?.prices?.price;
  const currency = product?.prices?.currency_code || 'USD';
  const price = rawPrice ? Number(rawPrice) / 100 : toNumber(product?.price);

  return {
    platform: 'woocommerce',
    externalProductId: String(product.id),
    title: product.name,
    storeName: parsed.hostname,
    price,
    currency,
    inStock: product.is_in_stock ?? true
  };
}

function parseWooHtml(html, hostname) {
  const $ = load(html);
  const title = $('h1.product_title').first().text().trim() || $('title').text().trim();
  const metaPrice = $('meta[itemprop="price"]').attr('content');
  const classPrice = $('.price').first().text();
  const price = toNumber(metaPrice) ?? toNumber(classPrice);

  const outOfStock = $('.out-of-stock').length > 0 || $('p.stock.out-of-stock').length > 0;

  if (!price) {
    return null;
  }

  return {
    platform: 'woocommerce',
    externalProductId: null,
    title,
    storeName: hostname,
    price,
    currency: 'USD',
    inStock: !outOfStock
  };
}

export async function fetchWooProduct(url) {
  const slug = extractWooSlug(url);
  const parsed = new URL(url);

  const apiProduct = await fetchFromStoreApi(url, slug);
  if (apiProduct?.price !== null && apiProduct?.price !== undefined) {
    return apiProduct;
  }

  const { data: html } = await axios.get(url, { timeout: 20000, responseType: 'text' });
  let product = parseWooHtml(html, parsed.hostname);

  if (!product) {
    const renderedHtml = await fetchRenderedHtml(url);
    product = parseWooHtml(renderedHtml, parsed.hostname);
  }

  if (!product) {
    throw new HttpError(404, 'WooCommerce product data unavailable');
  }

  return product;
}
