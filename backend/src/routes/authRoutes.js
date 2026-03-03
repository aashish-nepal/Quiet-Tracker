import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import {
  changeUserPassword,
  getAuthenticatedUser,
  getGoogleAuthUrl,
  loginWithEmail,
  loginWithGoogleCode,
  signupWithEmail,
  updateUserProfile,
  updateOnboardingStep,
  requestPasswordReset,
  resetPasswordWithToken
} from '../services/authService.js';
import { requireUserId } from '../middleware/requireUserId.js';
import { logAudit } from '../services/auditLogService.js';
import { env } from '../config/env.js';

const router = Router();

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const result = await signupWithEmail(req.body || {});

    await logAudit({
      organizationId: result.user.organizationId,
      userId: result.user.id,
      action: 'auth.signup',
      entityType: 'user',
      entityId: result.user.id,
      metadata: { method: 'email_password' }
    });

    res.status(201).json(result);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await loginWithEmail(req.body || {});

    await logAudit({
      organizationId: result.user.organizationId,
      userId: result.user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: result.user.id,
      metadata: { method: 'email_password' }
    });

    res.json(result);
  })
);

router.get(
  '/google/url',
  asyncHandler(async (req, res) => {
    if (!env.googleClientId || !env.googleRedirectUri) {
      return res.json({
        url: null,
        configured: false,
        error: 'Google OAuth is not configured'
      });
    }

    const state = String(req.query.state || '');
    const url = getGoogleAuthUrl(state);
    res.json({ url, configured: true });
  })
);

router.get(
  '/google/callback',
  asyncHandler(async (req, res) => {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const result = await loginWithGoogleCode({ code });

    await logAudit({
      organizationId: result.user.organizationId,
      userId: result.user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: result.user.id,
      metadata: { method: 'google_oauth', state }
    });

    const redirect = new URL('/auth/callback', env.frontendBaseUrl);
    redirect.searchParams.set('token', result.token);
    redirect.searchParams.set('userId', result.user.id);
    if (state) {
      redirect.searchParams.set('state', state);
    }

    res.redirect(302, redirect.toString());
  })
);

router.post(
  '/google/code',
  asyncHandler(async (req, res) => {
    const result = await loginWithGoogleCode({ code: req.body?.code });

    await logAudit({
      organizationId: result.user.organizationId,
      userId: result.user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: result.user.id,
      metadata: { method: 'google_oauth_code' }
    });

    res.json(result);
  })
);

router.get(
  '/me',
  requireUserId,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req.userId);
    res.json(user);
  })
);

router.patch(
  '/profile',
  requireUserId,
  asyncHandler(async (req, res) => {
    const profile = await updateUserProfile(req.userId, req.body || {});

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'profile.updated',
      entityType: 'user',
      entityId: req.userId,
      metadata: {
        name: profile.name,
        hasPhoto: Boolean(profile.photoUrl)
      }
    });

    res.json(profile);
  })
);

router.patch(
  '/password',
  requireUserId,
  asyncHandler(async (req, res) => {
    const result = await changeUserPassword(req.userId, req.body || {});

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'auth.password_changed',
      entityType: 'user',
      entityId: req.userId,
      metadata: { via: 'settings' }
    });

    res.json(result);
  })
);

router.patch(
  '/onboarding',
  requireUserId,
  asyncHandler(async (req, res) => {
    // L2: DB work moved to updateOnboardingStep in authService
    const row = await updateOnboardingStep(req.userId, {
      step: req.body?.step,
      completed: req.body?.completed
    });

    await logAudit({
      organizationId: req.organizationId,
      userId: req.userId,
      action: 'onboarding.update',
      entityType: 'user',
      entityId: req.userId,
      metadata: {
        onboardingStep: row?.onboarding_step,
        onboardingCompleted: row?.onboarding_completed
      }
    });

    res.json(row);
  })
);

router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const result = await requestPasswordReset(req.body?.email);
    res.json(result);
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const result = await resetPasswordWithToken({
      token: req.body?.token,
      newPassword: req.body?.newPassword
    });
    res.json(result);
  })
);

export default router;
