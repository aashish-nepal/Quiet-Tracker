import { query } from '../db/client.js';

export async function logAudit({ organizationId, userId, action, entityType, entityId = null, metadata = {} }) {
  await query(
    `INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [organizationId || null, userId || null, action, entityType, entityId, JSON.stringify(metadata || {})]
  );
}
