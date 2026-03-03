import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export function requireCronSecret(req, _res, next) {
  const secret = req.header('x-cron-secret');
  if (!secret || secret !== env.cronSecret) {
    throw new HttpError(401, 'Invalid cron secret');
  }
  next();
}
