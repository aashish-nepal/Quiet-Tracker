import { query, withTransaction } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';

export async function registerUser({ email, name, inviteCode }) {
  if (!email) {
    throw new HttpError(400, 'Email is required');
  }

  return withTransaction(async (client) => {
    const invite = await client.query(
      `SELECT * FROM invites WHERE code = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`,
      [inviteCode]
    );

    if (!invite.rows[0]) {
      throw new HttpError(403, 'Invalid or expired invite code');
    }

    const existing = await client.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (existing.rows[0]) {
      return { id: existing.rows[0].id, alreadyExists: true };
    }

    const userInsert = await client.query(
      `INSERT INTO users (email, name, is_beta_approved, created_at, updated_at)
       VALUES ($1, $2, true, NOW(), NOW())
       RETURNING id, email, name`,
      [email, name || null]
    );

    const orgInsert = await client.query(
      `INSERT INTO organizations (name, owner_user_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [`${name || email.split('@')[0]}'s Team`, userInsert.rows[0].id]
    );

    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, created_at, updated_at)
       VALUES ($1, $2, 'owner', NOW(), NOW())`,
      [orgInsert.rows[0].id, userInsert.rows[0].id]
    );

    await client.query('UPDATE users SET default_organization_id = $2 WHERE id = $1', [
      userInsert.rows[0].id,
      orgInsert.rows[0].id
    ]);

    await client.query('UPDATE invites SET used_count = used_count + 1 WHERE id = $1', [invite.rows[0].id]);
    await client.query(
      `INSERT INTO subscriptions (user_id, plan_id, status, created_at, updated_at)
       VALUES ($1, 'free', 'active', NOW(), NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [userInsert.rows[0].id]
    );

    return { ...userInsert.rows[0], organizationId: orgInsert.rows[0].id, alreadyExists: false };
  });
}
