const ApiError = require('../utils/ApiError');
const config = require('../config');

const trustGateway = (req, res, next) => {
  if (config.gatewaySharedSecret) {
    const gatewaySecret = req.headers['x-gateway-secret'];
    if (!gatewaySecret || gatewaySecret !== config.gatewaySharedSecret) {
      return next(new ApiError(401, 'Direct access to this service is not permitted'));
    }
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    return next(new ApiError(401, 'Authentication required'));
  }

  req.user = {
    id: userId,
    email: req.headers['x-user-email'] || null,
    role: req.headers['x-user-role'] || 'user',
    permissions: (() => {
      try {
        return JSON.parse(req.headers['x-user-permissions'] || '[]');
      } catch {
        return [];
      }
    })(),
  };

  next();
};

module.exports = trustGateway;
