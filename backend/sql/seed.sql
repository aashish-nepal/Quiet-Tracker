INSERT INTO plans (id, name, price_cents, product_limit, check_interval_hours, history_days, allowed_channels)
VALUES
  ('free', 'Free', 0, 2, 24, 7, ARRAY['email']::TEXT[]),
  ('starter', 'Starter', 2900, 20, 12, 30, ARRAY['email', 'slack', 'discord']::TEXT[])
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  product_limit = EXCLUDED.product_limit,
  check_interval_hours = EXCLUDED.check_interval_hours,
  history_days = EXCLUDED.history_days,
  allowed_channels = EXCLUDED.allowed_channels,
  updated_at = NOW();

INSERT INTO invites (code, is_active)
VALUES ('BETA-ACCESS-2026', true)
ON CONFLICT (code) DO NOTHING;
