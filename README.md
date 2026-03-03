# Quiet Competitor Price Tracker MVP+

Price tracker + pricing intelligence micro-SaaS for Shopify, WooCommerce, Amazon, and Etsy.

## Stack

- Backend: Node.js + Express + PostgreSQL
- Scraping/API: Playwright + platform adapters
- Frontend: Next.js + TailwindCSS
- Billing: Stripe subscriptions
- Notifications: SendGrid + Slack + Discord
- Scheduler: Vercel Cron -> secure backend internal routes

## What is implemented

### 1) Authentication and security

- Email/password auth (`/api/auth/signup`, `/api/auth/login`) with bcrypt hashing.
- Google OAuth flow (`/api/auth/google/url`, `/api/auth/google/callback`, `/api/auth/google/code`).
- JWT-based API auth (Bearer token) with fallback `x-user-id` for demo mode.
- Team RBAC with org roles:
  - `owner`
  - `team_member`
- Team management endpoints (`/api/team/members`).
- API rate limiting:
  - global API limiter
  - stricter auth limiter
- Audit logging (`audit_logs` table + `/api/audit/me`) including product add/update/remove/check and auth events.

### 2) Product normalization engine

- Platform adapter architecture in `backend/src/scrapers`:
  - `shopify.js`
  - `woocommerce.js`
  - `amazon.js`
  - `etsy.js`
  - `index.js`
- Currency normalization to USD base with exchange-rate cache (`exchange_rates` table).
- Variant key capture from URL + persisted variant metadata.
- Out-of-stock persistence in snapshots (`is_out_of_stock`, `stock_status`).
- Snapshot model stores original currency price and normalized USD price.

### 3) Screenshot proof on price change

- Playwright screenshot capture on triggered alerts.
- Screenshot path stored on snapshot + alert records.
- Email notifications attach screenshot evidence when available.

### 4) Smart alerts

Per-product strategy fields:

- `threshold_pct` (custom percent threshold)
- `alert_below_price`
- `own_price` + `undercut_enabled`
- `summary_mode` (`immediate` or `daily`)

Alert types generated:

- `threshold`
- `below_price`
- `undercut`

Daily summary pipeline:

- queued alerts (`is_summary_pending`)
- daily delivery job (`/api/internal/run-daily-summaries`)

### 5) Pricing intelligence layer

`/api/analytics/:userId` and `/api/analytics/me` provide:

- 30-day trend series
- most aggressive competitor report
- % time competitor was cheaper
- volatility score

### 6) Onboarding flow

Frontend includes a 3-step onboarding component with progress bar:

- Add first competitor URL
- Set alert threshold
- Choose notification mode

Progress persists via `/api/auth/onboarding`.

### 7) Usage meter

Dashboard shows:

- products used / plan cap
- progress bar
- next refresh time (`nextRefreshAt`)

### 8) Stripe upgrade improvements

- Self-serve billing portal (`/api/subscriptions/portal`)
- Plan change with proration (`/api/subscriptions/change-plan`)
- Failed payment -> grace period handling (`STRIPE_GRACE_DAYS`)
- Scheduled downgrade after grace via cron (`processGracePeriodDowngrades`)

### 9) Data protection and legal

Frontend legal + compliance surfaces:

- `/legal/terms`
- `/legal/privacy`
- cookie consent banner
- scraping compliance disclaimer in dashboard

### 10) Competitive expansion architecture

New adapter-based scraper layer in `backend/src/scrapers` makes adding platforms straightforward.

See: `backend/docs/platform-extension.md`

## Project structure

- `backend/sql/schema.sql`: full schema (auth, orgs, plans, products, snapshots, alerts, audit, billing)
- `backend/src/routes`: REST routes
- `backend/src/services`: business logic (auth, pricing, notifications, stripe, analytics)
- `backend/src/scrapers`: platform adapter modules
- `frontend/app`: dashboard UI + API proxies + auth/legal pages
- `frontend/vercel.json`: hourly + daily cron jobs

## Setup

## 1) Database

```bash
psql -d price_tracker -f backend/sql/schema.sql
psql -d price_tracker -f backend/sql/seed.sql
```

## 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required env highlights:

- Core: `DATABASE_URL`, `CRON_SECRET`, `JWT_SECRET`
- Access control: `CORS_ORIGINS`, `ENABLE_DEMO_AUTH` (set `false` in production)
- Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Notifications: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- FX normalization: `EXCHANGE_RATES_API_URL`
- Screenshot storage: `SCREENSHOT_STORAGE_DIR`, `SCREENSHOT_STORAGE_MODE` (`file` or `inline`)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_STARTER_YEARLY`, `STRIPE_TRIAL_DAYS`, `STRIPE_GRACE_DAYS`

## 3) Stripe setup

Create prices if needed:

```bash
cd backend
npm run stripe:bootstrap
```

Forward webhooks (use same API key account as backend):

```bash
stripe listen --api-key "$STRIPE_SECRET_KEY" --forward-to localhost:4000/api/stripe/webhook
```

## 4) Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

- `BACKEND_URL=http://localhost:4000`
- `ENABLE_DEMO_MODE=false` (set `true` only for demo environments)
- `DEMO_USER_ID=<optional fallback for demo mode>`
- `PROFILE_UPLOAD_MODE=inline` (`inline` or `disk`)
- `CRON_SECRET=<same as backend>`

## 5) Auth flows

- Web auth page: `/auth`
- Google callback target: `/auth/callback`

## Scheduler

- Hourly checks: `GET /api/cron/hourly`
- Daily summaries: `GET /api/cron/daily`

Both routes forward to backend with `CRON_SECRET`.

## Key API endpoints

- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/google/url`
  - `GET /api/auth/google/callback`
  - `GET /api/auth/me`
- Team/RBAC:
  - `GET /api/team/members`
  - `POST /api/team/members` (owner)
- Tracking:
  - `GET /api/products`
  - `POST /api/products`
  - `PATCH /api/products/:productId`
  - `POST /api/products/:productId/check`
- Dashboard + intelligence:
  - `GET /api/dashboard/me`
  - `GET /api/analytics/me`
- Billing:
  - `POST /api/subscriptions/checkout`
  - `POST /api/subscriptions/change-plan`
  - `POST /api/subscriptions/portal`
  - `POST /api/stripe/webhook`
- Internal cron:
  - `POST /api/internal/run-scheduled-checks`
  - `POST /api/internal/run-daily-summaries`

## Notes

- Amazon Product Advertising API credentials are required for Amazon price pulls.
- Scraping compatibility can change with storefront HTML updates.
- For production, use secure cookie settings, rotate JWT secrets, and lock down CORS origins.
