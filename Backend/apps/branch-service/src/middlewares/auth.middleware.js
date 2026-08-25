const ApiError = require('../utils/ApiError');
const config = require('../config');
const { catchAsync } = require('../utils/helpers');

/**
 * This service sits behind the gateway and does NOT re-verify JWTs. The
 * gateway already did that and forwards trusted identity via headers:
 *   X-User-Id, X-User-Email, X-User-Role, X-User-Permissions
 *
 * Two layers of defense:
 *  1. `x-gateway-secret` — a shared secret only the gateway knows, so a
 *     request that reaches this service directly (bypassing the gateway)
 *     is rejected outright.
 *  2. Downstream services should also not be network-reachable by clients
 *     in a real deployment (private subnet / service mesh) — this header
 *     check is defense-in-depth, not the only guard.
 */
const trustGateway = catchAsync(async (req, _res, next) => {
  if (config.gatewaySharedSecret) {
    const secret = req.headers['x-gateway-secret'];
    if (secret !== config.gatewaySharedSecret) {
      throw new ApiError(401, 'Direct access to this service is not permitted');
    }
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  let permissions = [];
  try {
    permissions = JSON.parse(req.headers['x-user-permissions'] || '[]');
  } catch (err) {
    permissions = [];
  }

  req.user = {
    id: userId,
    email: req.headers['x-user-email'] || '',
    role: req.headers['x-user-role'] || 'user',
    permissions,
  };

  next();
});

module.exports = trustGateway;
