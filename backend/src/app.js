import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimiters.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import internalRoutes from './routes/internalRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

import { handleStripeWebhook } from './services/stripeService.js';

const logger = pino({ level: env.nodeEnv === 'production' ? 'info' : 'debug' });

export function createApp() {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));

  // Stripe needs raw body for signature verification.
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    asyncHandler(async (req, res) => {
      const signature = req.header('stripe-signature');
      const result = await handleStripeWebhook(req.body, signature);
      res.json(result);
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiRateLimiter);

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRateLimiter, authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/internal', internalRoutes);

  app.use(errorHandler);

  return app;
}
