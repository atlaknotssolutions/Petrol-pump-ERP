const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');
const { catchAsync } = require('../utils/helpers');

const errorConverter = (err, _req, _res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, error.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, _next) => {
  let { statusCode, message } = err;

  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal server error';
  }

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

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

module.exports = { errorConverter, errorHandler, notFound, catchAsync };
