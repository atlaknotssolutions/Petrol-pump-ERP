const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/helpers');
const config = require('../config');

/**
 * Verifies the Bearer access token, loads the corresponding user from the DB,
 * and attaches it to req.user. Rejects if the user no longer exists, is
 * deactivated, or changed their password after the token was issued.
 */
const authenticate = catchAsync(async (req, _res, next) => {
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

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  if (user.changedPasswordAfter(payload.iat)) {
    throw new ApiError(401, 'Password was recently changed. Please log in again');
  }

  req.user = user;
  next();
});

/**
 * Optional authentication — attaches req.user if a valid token is present,
 * but does not reject the request if it's missing/invalid.
 */
const optionalAuthenticate = catchAsync(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.accessSecret);
    if (payload.type === 'access') {
      const user = await User.findById(payload.sub);
      if (user && user.isActive) req.user = user;
    }
  } catch (err) {
    // ignore invalid token in optional mode
  }

  next();
});

module.exports = { authenticate, optionalAuthenticate };
