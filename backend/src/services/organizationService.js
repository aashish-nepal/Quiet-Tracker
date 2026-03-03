import { query, withTransaction } from '../db/client.js';
import { HttpError } from '../utils/httpError.js';

export async function createDefaultOrganizationForUser(userId, name = 'My Team') {
  return withTransaction(async (client) => {
    const existing = await client.query('SELECT default_organization_id FROM users WHERE id = $1', [userId]);
    if (!existing.rows[0]) {
      throw new HttpError(404, 'User not found');
    }

    if (existing.rows[0].default_organization_id) {
      return existing.rows[0].default_organization_id;
    }

    const orgInsert = await client.query(
      `INSERT INTO organizations (name, owner_user_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [name, userId]
    );

    const orgId = orgInsert.rows[0].id;

    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, created_at, updated_at)
       VALUES ($1, $2, 'owner', NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [orgId, userId]
    );

    await client.query('UPDATE users SET default_organization_id = $2 WHERE id = $1', [userId, orgId]);

    return orgId;
  });
}

export async function getUserContext(userId) {
  const result = await query(
    `SELECT
      u.id AS user_id,
      u.email,
      u.default_organization_id,
      om.organization_id,
      om.role
    FROM users u
    LEFT JOIN organization_memberships om
      ON om.user_id = u.id
     AND (om.organization_id = u.default_organization_id OR u.default_organization_id IS NULL)
    WHERE u.id = $1
    ORDER BY CASE WHEN om.organization_id = u.default_organization_id THEN 0 ELSE 1 END
    LIMIT 1`,
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new HttpError(401, 'User context not found');
  }

  let orgId = row.default_organization_id || row.organization_id;
  let role = row.role;

  if (!orgId) {
    orgId = await createDefaultOrganizationForUser(userId);
    role = 'owner';
  }

  if (!role) {
    await query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, created_at, updated_at)
       VALUES ($1, $2, 'team_member', NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [orgId, userId]
    );
    role = 'team_member';
  }

  return {
    userId,
    organizationId: orgId,
    role,
    email: row.email
  };
}

export async function addTeamMember({ ownerUserId, organizationId, email, role = 'team_member' }) {
  if (!['owner', 'team_member'].includes(role)) {
    throw new HttpError(400, 'Invalid role');
  }

  const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
  const targetUser = userRes.rows[0];
  if (!targetUser) {
    throw new HttpError(404, 'User with this email does not exist yet');
  }

  await query(
    `INSERT INTO organization_memberships (organization_id, user_id, role, invited_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (organization_id, user_id)
     DO UPDATE SET role = EXCLUDED.role, invited_by_user_id = EXCLUDED.invited_by_user_id, updated_at = NOW()`,
    [organizationId, targetUser.id, role, ownerUserId]
  );

  await query(
    'UPDATE users SET default_organization_id = COALESCE(default_organization_id, $2) WHERE id = $1',
    [targetUser.id, organizationId]
  );

  return { userId: targetUser.id, organizationId, role };
}

export async function listTeamMembers(organizationId) {
  const result = await query(
    `SELECT u.id, u.email, u.name, om.role, om.created_at
     FROM organization_memberships om
     JOIN users u ON u.id = om.user_id
     WHERE om.organization_id = $1
     ORDER BY CASE WHEN om.role = 'owner' THEN 0 ELSE 1 END, u.email ASC`,
    [organizationId]
  );

  return result.rows;
}
