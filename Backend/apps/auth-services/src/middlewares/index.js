const { authenticate, optionalAuthenticate } = require('./auth.middleware');
const { authorize, requirePermission, selfOrRole } = require('./role.middleware');
const validate = require('./validate.middleware');
const { errorConverter, errorHandler, notFound } = require('./error.middleware');

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  requirePermission,
  selfOrRole,
  validate,
  errorConverter,
  errorHandler,
  notFound,
};
