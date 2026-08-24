const ApiError = require('../utils/ApiError');

/**
 * Restricts a route to specific roles.
 * Usage: router.get('/admin', authenticate, authorize('admin', 'superadmin'), handler)
 */
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

/**
 * Restricts a route to users holding a specific permission
 * (superadmins implicitly pass, see User.hasPermission).
 * Usage: router.delete('/users/:id', authenticate, requirePermission('users:delete'), handler)
 */
const requirePermission = (...requiredPermissions) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const hasAll = requiredPermissions.every((perm) => req.user.hasPermission(perm));
    if (!hasAll) {
      return next(new ApiError(403, 'Insufficient permissions for this action'));
    }

    next();
  };
};

/**
 * Allows access if the authenticated user is either the resource owner
 * (req.params[paramName] === req.user._id) OR has one of the given roles.
 */
const selfOrRole = (paramName, ...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const isSelf = req.params[paramName] === req.user._id.toString();
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = { authorize, requirePermission, selfOrRole };
