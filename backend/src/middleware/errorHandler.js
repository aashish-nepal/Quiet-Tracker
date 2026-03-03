import { HttpError } from '../utils/httpError.js';

export function errorHandler(err, req, res, _next) {
  req.log?.error({ err }, 'request failed');

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details
    });
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
}
