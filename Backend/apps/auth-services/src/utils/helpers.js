/**
 * Wraps an async route handler so rejected promises are forwarded to
 * Express's error-handling middleware instead of crashing the process.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard success response shape.
 */
const sendResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Strips sensitive fields off a Mongoose user document before sending it
 * back to the client.
 */
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  delete user.refreshTokens;
  delete user.__v;
  return user;
};

module.exports = { catchAsync, sendResponse, sanitizeUser };
