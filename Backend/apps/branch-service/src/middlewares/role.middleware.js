const ApiError = require('../utils/ApiError');

const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

const requirePermission = (...requiredPermissions) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    const hasAll = requiredPermissions.every(
      (perm) => req.user.role === 'superadmin' || req.user.permissions.includes(perm)
    );
    if (!hasAll) {
      return next(new ApiError(403, 'Insufficient permissions for this action'));
    }
    next();
  };
};

module.exports = { authorize, requirePermission };
