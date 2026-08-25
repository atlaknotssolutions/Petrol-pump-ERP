const trustGateway = require('./auth.middleware');
const { authorize, requirePermission } = require('./role.middleware');
const validate = require('./validate.middleware');
const { errorConverter, errorHandler, notFound } = require('./error.middleware');

module.exports = {
  trustGateway,
  authorize,
  requirePermission,
  validate,
  errorConverter,
  errorHandler,
  notFound,
};
