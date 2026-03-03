import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { requireRole } from '../middleware/authContext.js';
import { addTeamMember, listTeamMembers } from '../services/organizationService.js';
import { logAudit } from '../services/auditLogService.js';

const router = Router();

router.get(
  '/members',
  requireUserId,
  asyncHandler(async (req, res) => {
    const members = await listTeamMembers(req.organizationId);
    res.json(members);
  })
);

router.post(
  '/members',
  requireUserId,
  requireRole('owner'),
  asyncHandler(async (req, res) => {
    const { email, role } = req.body || {};
    const membership = await addTeamMember({
      ownerUserId: req.userId,
      organizationId: req.organizationId,
      email,
      role: role || 'team_member'
    });

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'team.member_added',
      entityType: 'organization_membership',
      entityId: membership.userId,
      metadata: { email, role: membership.role }
    });

    res.status(201).json(membership);
  })
);

export default router;
