const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Converts known error types (Mongoose validation, cast, duplicate key,
 * JWT errors, etc.) into a normalized ApiError so downstream handling
 * is consistent.
 */
const errorConverter = (err, _req, _res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';

    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((e) => e.message)
        .join('; ');
    } else if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `Invalid value for field "${error.path}"`;
    } else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = field ? `${field} already in use` : 'Duplicate field value';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message, false, error.stack);
  }

  next(error);
};

/**
 * Final error handler — logs and sends a JSON error response.
 * Must be registered last, after all routes.
 */
const errorHandler = (err, req, res, _next) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal server error';
  }

  res.locals.errorMessage = err.message;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

/**
 * Catches requests to undefined routes.
 */
const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

module.exports = { errorConverter, errorHandler, notFound };
