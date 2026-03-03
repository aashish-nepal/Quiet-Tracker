CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  product_limit INTEGER NOT NULL,
  check_interval_hours INTEGER NOT NULL,
  history_days INTEGER,
  allowed_channels TEXT[] NOT NULL DEFAULT ARRAY['email']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  is_beta_approved BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT UNIQUE,
  default_organization_id UUID,
  onboarding_step INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'team_member')),
  invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  store_name TEXT,
  competitor_name TEXT,
  external_product_id TEXT,
  product_title TEXT,
  product_group TEXT,
  variant_key TEXT,
  currency TEXT DEFAULT 'USD',
  base_currency TEXT NOT NULL DEFAULT 'USD',
  last_price_usd NUMERIC(12,4),
  threshold_pct NUMERIC(8,2) NOT NULL DEFAULT 1.00,
  alert_below_price NUMERIC(12,2),
  own_price NUMERIC(12,2),
  undercut_enabled BOOLEAN NOT NULL DEFAULT false,
  summary_mode TEXT NOT NULL DEFAULT 'immediate' CHECK (summary_mode IN ('immediate', 'daily')),
  screenshot_on_change BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracked_product_id UUID NOT NULL REFERENCES tracked_products(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  original_currency TEXT,
  price_usd NUMERIC(12,4),
  variant_key TEXT,
  stock_status TEXT NOT NULL,
  is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  screenshot_path TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tracked_product_id UUID NOT NULL REFERENCES tracked_products(id) ON DELETE CASCADE,
  old_price NUMERIC(12,2) NOT NULL,
  new_price NUMERIC(12,2) NOT NULL,
  pct_change NUMERIC(10,4) NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'threshold',
  screenshot_path TEXT,
  summary_bucket_date DATE,
  is_summary_pending BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  notified_channels TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'slack', 'discord')),
  target TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, type, target)
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  base_currency TEXT PRIMARY KEY,
  rates_json JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS google_sub TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS default_organization_id UUID,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ;

ALTER TABLE tracked_products
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS competitor_name TEXT,
  ADD COLUMN IF NOT EXISTS product_group TEXT,
  ADD COLUMN IF NOT EXISTS variant_key TEXT,
  ADD COLUMN IF NOT EXISTS base_currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS last_price_usd NUMERIC(12,4),
  ADD COLUMN IF NOT EXISTS alert_below_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS own_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS undercut_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS summary_mode TEXT NOT NULL DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS screenshot_on_change BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE price_snapshots
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS original_currency TEXT,
  ADD COLUMN IF NOT EXISTS price_usd NUMERIC(12,4),
  ADD COLUMN IF NOT EXISTS variant_key TEXT,
  ADD COLUMN IF NOT EXISTS is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS screenshot_path TEXT;

ALTER TABLE price_alerts
  ADD COLUMN IF NOT EXISTS alert_type TEXT NOT NULL DEFAULT 'threshold',
  ADD COLUMN IF NOT EXISTS screenshot_path TEXT,
  ADD COLUMN IF NOT EXISTS summary_bucket_date DATE,
  ADD COLUMN IF NOT EXISTS is_summary_pending BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tracked_products_summary_mode_check'
  ) THEN
    ALTER TABLE tracked_products
      ADD CONSTRAINT tracked_products_summary_mode_check
      CHECK (summary_mode IN ('immediate', 'daily'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_tracked_products_user_active
  ON tracked_products (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_tracked_products_org_active
  ON tracked_products (organization_id, is_active);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tracked_products_user_url_active
  ON tracked_products (user_id, url)
  WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tracked_products_org_url_active
  ON tracked_products (organization_id, url)
  WHERE is_active = true
    AND organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tracked_products_next_check
  ON tracked_products (next_check_at)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_org_memberships_user
  ON organization_memberships (user_id, organization_id, role);

CREATE INDEX IF NOT EXISTS idx_price_snapshots_product_captured
  ON price_snapshots (tracked_product_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_created
  ON price_alerts (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_summary_pending
  ON price_alerts (user_id, is_summary_pending, summary_bucket_date);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created
  ON audit_logs (organization_id, created_at DESC);

-- Password reset tokens for the forgot-password flow
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '1 hour',
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
  ON password_reset_tokens (token)
  WHERE used_at IS NULL;

-- Organisation invites for the team invite-by-email flow
CREATE TABLE IF NOT EXISTS org_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'team_member',
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token
  ON org_invites (token)
  WHERE accepted_at IS NULL;

