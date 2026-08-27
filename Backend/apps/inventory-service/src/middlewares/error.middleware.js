const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

const errorConverter = (err, req, res, next) => {
  let error = err;

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors).map((e) => e.message).join('; ');
    error = new ApiError(400, message, true, err.stack);
  } else if (err instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid value for field "${err.path}"`, true, err.stack);
  } else if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field} already in use`, true, err.stack);
  } else if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message = 'Internal server error', isOperational, stack } = err;

  if (config.env === 'production' && !isOperational) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  } else {
    const response = {
      success: false,
      message,
    };

    if (config.env === 'development') {
      response.stack = stack;
    }

    res.status(statusCode).json(response);
  }

  if (statusCode >= 500) {
    logger.error(err.message, { stack });
  } else {
    logger.warn(err.message);
  }
};

module.exports = { notFound, errorConverter, errorHandler };
