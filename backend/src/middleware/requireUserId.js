import { resolveAuthContext } from './authContext.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Wrap in asyncHandler so Express 4 properly catches async rejections
// from resolveAuthContext (e.g. getUserContext DB failures).
export const requireUserId = asyncHandler(resolveAuthContext);
