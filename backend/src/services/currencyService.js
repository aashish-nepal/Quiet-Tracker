import axios from 'axios';

import { env } from '../config/env.js';
import { query } from '../db/client.js';

const SYMBOL_MAP = {
  '$': 'USD',
  'US$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  'C$': 'CAD',
  'A$': 'AUD'
};

function normalizeCurrencyCode(currency) {
  if (!currency) return 'USD';
  const trimmed = String(currency).trim().toUpperCase();
  if (trimmed.length === 3) return trimmed;
  return SYMBOL_MAP[trimmed] || 'USD';
}

async function fetchLiveRates() {
  const { data } = await axios.get(env.exchangeRatesApiUrl, { timeout: 15000 });

  const rates = data?.rates;
  if (!rates || typeof rates !== 'object') {
    throw new Error('Invalid exchange rates payload');
  }

  await query(
    `INSERT INTO exchange_rates (base_currency, rates_json, fetched_at)
     VALUES ('USD', $1::jsonb, NOW())
     ON CONFLICT (base_currency)
     DO UPDATE SET rates_json = EXCLUDED.rates_json, fetched_at = NOW()`,
    [JSON.stringify(rates)]
  );

  return rates;
}

async function getUsdRates() {
  const stored = await query(
    `SELECT rates_json, fetched_at
     FROM exchange_rates
     WHERE base_currency = 'USD'
     LIMIT 1`
  );

  const row = stored.rows[0];
  const maxAgeMs = 6 * 60 * 60 * 1000;
  const fresh = row?.fetched_at ? Date.now() - new Date(row.fetched_at).getTime() < maxAgeMs : false;

  if (row?.rates_json && fresh) {
    return row.rates_json;
  }

  try {
    return await fetchLiveRates();
  } catch {
    return row?.rates_json || { USD: 1 };
  }
}

export async function normalizePriceToUsd({ amount, currency }) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return {
      originalAmount: null,
      originalCurrency: normalizeCurrencyCode(currency),
      usdAmount: null,
      fxRate: null
    };
  }

  const originalCurrency = normalizeCurrencyCode(currency);
  if (originalCurrency === 'USD') {
    return {
      originalAmount: numeric,
      originalCurrency,
      usdAmount: numeric,
      fxRate: 1
    };
  }

  const rates = await getUsdRates();
  const perUsd = Number(rates[originalCurrency]);

  if (!Number.isFinite(perUsd) || perUsd <= 0) {
    return {
      originalAmount: numeric,
      originalCurrency,
      usdAmount: numeric,
      fxRate: 1
    };
  }

  return {
    originalAmount: numeric,
    originalCurrency,
    usdAmount: numeric / perUsd,
    fxRate: 1 / perUsd
  };
}
