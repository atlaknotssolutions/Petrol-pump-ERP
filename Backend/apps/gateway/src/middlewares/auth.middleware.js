const jwt = require('jsonwebtoken');
const config = require('../config');
const services = require('../config/services');
const ApiError = require('../utils/ApiError');
const { isPublicPath } = require('../utils/pathMatcher');
const { catchAsync } = require('../utils/helpers');


const gatewayAuth = catchAsync(async (req, _res, next) => {
  const matchedService = services.find((svc) => req.path.startsWith(svc.prefix));

  if (matchedService) {
    const relativePath = req.path.slice(matchedService.prefix.length) || '/';
    if (isPublicPath(relativePath, matchedService.public)) {
      return next();
    }
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Provide a Bearer token.');
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }

  if (payload.type !== 'access') {
    throw new ApiError(401, 'Invalid token type');
  }

  // Attach identity for downstream services & route handlers
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions || [],
  };

  // Strip any client-supplied identity headers to prevent spoofing, then
  // inject the verified ones.
  delete req.headers['x-user-id'];
  delete req.headers['x-user-email'];
  delete req.headers['x-user-role'];
  delete req.headers['x-user-permissions'];

  req.headers['x-user-id'] = req.user.id;
  req.headers['x-user-email'] = req.user.email || '';
  req.headers['x-user-role'] = req.user.role || '';
  req.headers['x-user-permissions'] = JSON.stringify(req.user.permissions);

  next();
});

module.exports = gatewayAuth;
