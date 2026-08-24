const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidation = require('../validations/auth.validation');
const {
  authenticate,
  authorize,
  validate,
} = require('../middlewares');

const router = express.Router();

// --- Public routes ---
router.post('/auth/register', validate(authValidation.register), authController.register);
router.post('/auth/login', validate(authValidation.login), authController.login);
router.post('/auth/refresh', validate(authValidation.refreshToken), authController.refresh);

// --- Authenticated routes ---
router.post(
  '/auth/logout',
  authenticate,
  validate(authValidation.logout),
  authController.logout
);
router.post('/auth/logout-all', authenticate, authController.logoutAll);
router.get('/auth/me', authenticate, authController.getMe);
router.patch(
  '/auth/change-password',
  authenticate,
  validate(authValidation.changePassword),
  authController.changePassword
);

// --- Admin-only routes ---
router.get('/users', authenticate, authorize('admin', 'superadmin'), authController.listUsers);
router.patch(
  '/users/:userId/role',
  authenticate,
  authorize('superadmin'),
  validate(authValidation.updateRole),
  authController.updateUserRole
);
router.patch(
  '/users/:userId/deactivate',
  authenticate,
  authorize('admin', 'superadmin'),
  authController.deactivateUser
);

module.exports = router;
