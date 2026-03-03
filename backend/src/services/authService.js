import { createHash } from 'crypto';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { query, withTransaction } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';
import { createDefaultOrganizationForUser } from './organizationService.js';

function assertJwtConfigured() {
  if (!env.jwtSecret) {
    throw new HttpError(500, 'JWT authentication is not configured');
  }
}

function signAuthToken(payload) {
  assertJwtConfigured();
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyAuthToken(token) {
  try {
    assertJwtConfigured();
    return jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Invalid or expired auth token');
  }
}

async function ensureFreeSubscription(userId, client) {
  await client.query(
    `INSERT INTO subscriptions (user_id, plan_id, status, created_at, updated_at)
     VALUES ($1, 'free', 'active', NOW(), NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

function isMissingPhotoUrlColumnError(error) {
  return error?.code === '42703' && String(error?.message || '').includes('photo_url');
}

/**
 * Run `queryWithPhoto`, fall back to `queryWithoutPhoto` if the DB schema
 * does not yet have the `photo_url` column (migration guard).
 */
async function queryWithPhotoFallback(withPhotoFn, withoutPhotoFn) {
  try {
    return await withPhotoFn();
  } catch (error) {
    if (!isMissingPhotoUrlColumnError(error)) throw error;
    return withoutPhotoFn();
  }
}

async function createUserWithOrg({ email, name, passwordHash = null, googleSub = null }) {
  return withTransaction(async (client) => {
    const insert = await queryWithPhotoFallback(
      () =>
        client.query(
          `INSERT INTO users (email, name, password_hash, google_sub, is_beta_approved, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())
           RETURNING id, email, name, photo_url`,
          [email, name || null, passwordHash, googleSub]
        ),
      () =>
        client.query(
          `INSERT INTO users (email, name, password_hash, google_sub, is_beta_approved, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())
           RETURNING id, email, name`,
          [email, name || null, passwordHash, googleSub]
        )
    );

    const user = insert.rows[0];

    const orgInsert = await client.query(
      `INSERT INTO organizations (name, owner_user_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [`${name || email.split('@')[0]}'s Team`, user.id]
    );

    const orgId = orgInsert.rows[0].id;

    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, created_at, updated_at)
       VALUES ($1, $2, 'owner', NOW(), NOW())`,
      [orgId, user.id]
    );

    await client.query('UPDATE users SET default_organization_id = $2 WHERE id = $1', [user.id, orgId]);
    await ensureFreeSubscription(user.id, client);

    return { ...user, organizationId: orgId, role: 'owner' };
  });
}

function normalizeProfileName(name) {
  const normalized = String(name || '').trim();
  if (!normalized) {
    throw new HttpError(400, 'Name is required');
  }
  if (normalized.length > 120) {
    throw new HttpError(400, 'Name must be 120 characters or fewer');
  }
  return normalized;
}

function normalizePhotoUrl(photoUrl) {
  if (photoUrl === null || photoUrl === undefined || String(photoUrl).trim() === '') {
    return null;
  }

  const normalized = String(photoUrl).trim();
  if (normalized.startsWith('data:image/')) {
    const isValidInlineImage = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(normalized);
    if (!isValidInlineImage) {
      throw new HttpError(400, 'Inline photo must be a valid base64 image data URL');
    }
    if (normalized.length > 1_400_000) {
      throw new HttpError(400, 'Inline photo is too large');
    }
    return normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new HttpError(400, 'Photo URL must be a valid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, 'Photo URL must start with http:// or https://');
  }

  return parsed.toString();
}

export async function signupWithEmail({ email, password, name }) {
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  // M2: Validate email format before touching the DB
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email))) {
    throw new HttpError(400, 'A valid email address is required');
  }

  if (String(password).length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters');
  }

  const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
  if (existing.rows[0]) {
    throw new HttpError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUserWithOrg({ email: email.toLowerCase(), name, passwordHash });
  const token = signAuthToken({ sub: user.id, orgId: user.organizationId, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url || null,
      organizationId: user.organizationId,
      role: user.role
    }
  };
}

export async function loginWithEmail({ email, password }) {
  const result = await queryWithPhotoFallback(
    () =>
      query(
        `SELECT id, email, name, photo_url, password_hash, default_organization_id
         FROM users WHERE email = $1 LIMIT 1`,
        [String(email || '').toLowerCase()]
      ),
    () =>
      query(
        `SELECT id, email, name, password_hash, default_organization_id
         FROM users WHERE email = $1 LIMIT 1`,
        [String(email || '').toLowerCase()]
      )
  );

  const user = result.rows[0];
  if (!user?.password_hash) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const orgId = user.default_organization_id || (await createDefaultOrganizationForUser(user.id));
  const roleRes = await query(
    'SELECT role FROM organization_memberships WHERE organization_id = $1 AND user_id = $2 LIMIT 1',
    [orgId, user.id]
  );

  const role = roleRes.rows[0]?.role || 'team_member';
  const token = signAuthToken({ sub: user.id, orgId, role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      photoUrl: user.photo_url || null,
      organizationId: orgId,
      role
    }
  };
}

export function getGoogleAuthUrl(state = '') {
  if (!env.googleClientId || !env.googleRedirectUri) {
    throw new HttpError(500, 'Google OAuth is not configured');
  }

  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function loginWithGoogleCode({ code }) {
  if (!env.googleClientId || !env.googleClientSecret || !env.googleRedirectUri) {
    throw new HttpError(500, 'Google OAuth is not configured');
  }

  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.googleRedirectUri
    },
    { timeout: 20000 }
  );

  const accessToken = tokenRes.data?.access_token;
  if (!accessToken) {
    throw new HttpError(400, 'Failed to exchange Google auth code');
  }

  const profileRes = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 20000
  });

  const profile = profileRes.data;
  if (!profile?.email || !profile?.sub) {
    throw new HttpError(400, 'Google profile payload is incomplete');
  }

  let userRow;
  const existing = await queryWithPhotoFallback(
    () =>
      query(
        `SELECT id, email, name, photo_url, default_organization_id
         FROM users WHERE google_sub = $1 OR email = $2 LIMIT 1`,
        [profile.sub, profile.email.toLowerCase()]
      ),
    () =>
      query(
        `SELECT id, email, name, default_organization_id
         FROM users WHERE google_sub = $1 OR email = $2 LIMIT 1`,
        [profile.sub, profile.email.toLowerCase()]
      )
  );

  if (existing.rows[0]) {
    const userId = existing.rows[0].id;
    await query(
      `UPDATE users
       SET google_sub = COALESCE(google_sub, $2),
           name = COALESCE(name, $3),
           updated_at = NOW()
       WHERE id = $1`,
      [userId, profile.sub, profile.name || null]
    );

    const refreshed = await queryWithPhotoFallback(
      () =>
        query(
          `SELECT id, email, name, photo_url, default_organization_id
           FROM users WHERE id = $1 LIMIT 1`,
          [userId]
        ),
      () =>
        query(
          `SELECT id, email, name, default_organization_id
           FROM users WHERE id = $1 LIMIT 1`,
          [userId]
        )
    );
    userRow = refreshed.rows[0];
  } else {
    const created = await createUserWithOrg({
      email: profile.email.toLowerCase(),
      name: profile.name || profile.given_name || profile.email,
      googleSub: profile.sub
    });

    userRow = {
      id: created.id,
      email: created.email,
      name: created.name,
      photo_url: created.photo_url || null,
      default_organization_id: created.organizationId
    };
  }

  const orgId = userRow.default_organization_id || (await createDefaultOrganizationForUser(userRow.id));
  const roleRes = await query(
    'SELECT role FROM organization_memberships WHERE organization_id = $1 AND user_id = $2 LIMIT 1',
    [orgId, userRow.id]
  );
  const role = roleRes.rows[0]?.role || 'team_member';

  const token = signAuthToken({ sub: userRow.id, orgId, role });

  return {
    token,
    user: {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      photoUrl: userRow.photo_url || null,
      organizationId: orgId,
      role
    }
  };
}

export async function getAuthenticatedUser(userId) {
  const result = await queryWithPhotoFallback(
    () =>
      query(
        `SELECT id, email, name, photo_url, password_hash, default_organization_id, onboarding_step, onboarding_completed
         FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      ),
    () =>
      query(
        `SELECT id, email, name, password_hash, default_organization_id, onboarding_step, onboarding_completed
         FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      )
  );

  if (!result.rows[0]) {
    throw new HttpError(404, 'User not found');
  }

  const user = result.rows[0];
  const orgId = user.default_organization_id || (await createDefaultOrganizationForUser(user.id));
  const roleRes = await query(
    'SELECT role FROM organization_memberships WHERE organization_id = $1 AND user_id = $2 LIMIT 1',
    [orgId, user.id]
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photo_url || null,
    hasPassword: Boolean(user.password_hash),
    organizationId: orgId,
    role: roleRes.rows[0]?.role || 'team_member',
    onboardingStep: user.onboarding_step,
    onboardingCompleted: user.onboarding_completed
  };
}

export async function updateUserProfile(userId, { name, photoUrl }) {
  const normalizedName = normalizeProfileName(name);
  const normalizedPhotoUrl = normalizePhotoUrl(photoUrl);

  const result = await queryWithPhotoFallback(
    () =>
      query(
        `UPDATE users
         SET name = $2,
             photo_url = $3,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, name, photo_url`,
        [userId, normalizedName, normalizedPhotoUrl]
      ),
    () =>
      query(
        `UPDATE users
         SET name = $2,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, name`,
        [userId, normalizedName]
      )
  );

  if (!result.rows[0]) {
    throw new HttpError(404, 'User not found');
  }

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    name: result.rows[0].name,
    photoUrl: result.rows[0].photo_url || null
  };
}

export async function changeUserPassword(userId, { currentPassword, newPassword }) {
  const nextPassword = String(newPassword || '');
  if (nextPassword.length < 8) {
    throw new HttpError(400, 'New password must be at least 8 characters');
  }

  const result = await query('SELECT password_hash FROM users WHERE id = $1 LIMIT 1', [userId]);
  const user = result.rows[0];
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (user.password_hash) {
    const ok = await bcrypt.compare(String(currentPassword || ''), user.password_hash);
    if (!ok) {
      throw new HttpError(401, 'Current password is incorrect');
    }
  }

  const newHash = await bcrypt.hash(nextPassword, 10);
  await query('UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1', [userId, newHash]);

  return { success: true };
}

// L2: Moved from authRoutes inline handler so routes stay free of direct DB access.
export async function updateOnboardingStep(userId, { step, completed }) {
  const result = await query(
    `UPDATE users
     SET onboarding_step = GREATEST(0, $2),
         onboarding_completed = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING onboarding_step, onboarding_completed`,
    [userId, Number(step || 0), Boolean(completed)]
  );
  return result.rows[0];
}

/**
 * Initiate the forgot-password flow.
 * Creates a one-hour reset token for the given email and sends a link via SendGrid.
 * Always returns success to avoid leaking whether the email is registered.
 */
export async function requestPasswordReset(email) {
  if (!email) {
    throw new HttpError(400, 'Email is required');
  }

  const userRes = await query(
    'SELECT id, email FROM users WHERE email = $1 LIMIT 1',
    [String(email).toLowerCase().trim()]
  );
  const user = userRes.rows[0];

  // Silently succeed if no such user — avoids email enumeration
  if (!user) return { sent: true };

  // Invalidate any existing unused tokens for this user
  await query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [user.id]
  );

  // Generate a secure random token — store only its SHA-256 hash in the DB
  // so a DB read leak cannot be used to reset passwords directly.
  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [user.id, tokenHash]
  );

  // Send the reset email if SendGrid is configured
  if (env.sendgridApiKey && env.sendgridFromEmail) {
    const sendgrid = (await import('@sendgrid/mail')).default;
    sendgrid.setApiKey(env.sendgridApiKey);

    // Send the RAW token in the link — only the hash lives in the DB
    const resetUrl = `${env.frontendBaseUrl}/auth/reset-password?token=${rawToken}`;
    await sendgrid.send({
      to: user.email,
      from: env.sendgridFromEmail,
      subject: 'Reset your Quiet Tracker password',
      text: `You requested a password reset.\n\nClick the link below to set a new password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0f1117;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
          <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
            <div style="width:28px;height:28px;border-radius:8px;background:#3b82f6;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-size:14px">🔑</span>
            </div>
            <span style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#60a5fa">Quiet Tracker</span>
          </div>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#f1f5f9">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6">You requested a password reset. Click the button below to choose a new password. This link expires in <strong style="color:#f1f5f9">1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#3b82f6,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px">Reset Password</a>
          <p style="margin:24px 0 0;font-size:12px;color:#64748b;line-height:1.6">If you did not request this, you can safely ignore this email — your password will remain unchanged.</p>
        </div>
      `
    });
  }

  return { sent: true };
}

function hashResetToken(rawToken) {
  return createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Complete the password reset flow.
 * Validates the token (must be unused and not expired) then sets the new password.
 */
export async function resetPasswordWithToken({ token, newPassword }) {
  if (!token) {
    throw new HttpError(400, 'Reset token is required');
  }
  const nextPassword = String(newPassword || '');
  if (nextPassword.length < 8) {
    throw new HttpError(400, 'New password must be at least 8 characters');
  }

  // Hash the incoming raw token before lookup — DB only stores the hash
  const tokenHash = hashResetToken(String(token));

  const tokenRes = await query(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const row = tokenRes.rows[0];
  if (!row) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  const newHash = await bcrypt.hash(nextPassword, 10);

  await query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
    [row.id]
  );
  await query(
    `UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`,
    [row.user_id, newHash]
  );

  return { success: true };
}
