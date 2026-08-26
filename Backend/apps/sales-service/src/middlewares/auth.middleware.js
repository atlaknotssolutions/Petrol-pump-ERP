const ApiError = require('../utils/ApiError');
const config = require('../config');
const { catchAsync } = require('../utils/helpers');

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
