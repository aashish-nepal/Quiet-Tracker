import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'CRON_SECRET', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[env] FATAL: Missing required env var: ${key}. Refusing to start.`);
    process.exit(1);
  }
}

const normalizeUrl = (url, defaultVal) => {
  const absolute = String(url || defaultVal || '').trim();
  if (!absolute) return absolute;
  if (absolute.startsWith('http')) return absolute;
  return `https://${absolute}`;
};

const corsOrigins = String(process.env.CORS_ORIGINS || process.env.FRONTEND_BASE_URL || 'http://localhost:3000')
  .split(',')
  .map((value) => normalizeUrl(value))
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  appBaseUrl: normalizeUrl(process.env.APP_BASE_URL, 'http://localhost:4000'),
  frontendBaseUrl: normalizeUrl(process.env.FRONTEND_BASE_URL, 'http://localhost:3000'),
  corsOrigins,
  databaseUrl: process.env.DATABASE_URL,
  cronSecret: process.env.CRON_SECRET,
  jwtSecret: process.env.JWT_SECRET,
  enableDemoAuth: String(process.env.ENABLE_DEMO_AUTH || '').toLowerCase() === 'true',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  apiRateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX || 300),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 40),
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  screenshotStorageDir: process.env.SCREENSHOT_STORAGE_DIR || './storage/screenshots',
  screenshotStorageMode:
    process.env.SCREENSHOT_STORAGE_MODE || (process.env.NODE_ENV === 'production' ? 'inline' : 'file'),
  exchangeRatesApiUrl: process.env.EXCHANGE_RATES_API_URL || 'https://open.er-api.com/v6/latest/USD',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceStarter: process.env.STRIPE_PRICE_STARTER,
  stripePriceStarterYearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  stripeTrialDays: Number(process.env.STRIPE_TRIAL_DAYS || 7),
  stripeGraceDays: Number(process.env.STRIPE_GRACE_DAYS || 3),
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL,
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: normalizeUrl(process.env.GOOGLE_REDIRECT_URI),
  amazonPartnerTag: process.env.AMAZON_PARTNER_TAG,
  amazonAccessKey: process.env.AMAZON_ACCESS_KEY,
  amazonSecretKey: process.env.AMAZON_SECRET_KEY,
  amazonMarketplace: process.env.AMAZON_MARKETPLACE || 'www.amazon.com',
  etsyApiKey: process.env.ETSY_API_KEY
};
