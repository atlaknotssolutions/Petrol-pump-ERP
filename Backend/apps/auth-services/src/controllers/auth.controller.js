const authService = require('../services/auth.service');
const User = require('../models/user.model');
const { catchAsync, sendResponse, sanitizeUser } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.registerUser(req.body);
  sendResponse(res, 201, { user: sanitizeUser(user), tokens }, 'User registered successfully');
});

const login = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.loginUser(req.body);
  sendResponse(res, 200, { user: sanitizeUser(user), tokens }, 'Logged in successfully');
});

const refresh = catchAsync(async (req, res) => {
  const { user, tokens } = await authService.refreshAuthTokens(req.body.refreshToken);
  sendResponse(res, 200, { user: sanitizeUser(user), tokens }, 'Token refreshed successfully');
});

const logout = catchAsync(async (req, res) => {
  await authService.logoutUser(req.user._id, req.body.refreshToken);
  sendResponse(res, 200, null, 'Logged out successfully');
});

const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAllSessions(req.user._id);
  sendResponse(res, 200, null, 'Logged out from all sessions');
});

const getMe = catchAsync(async (req, res) => {
  sendResponse(res, 200, { user: sanitizeUser(req.user) });
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword(req.user._id, currentPassword, newPassword);
  sendResponse(res, 200, { user: sanitizeUser(user) }, 'Password changed successfully');
});

// --- Admin-only user management ---

const listUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [users, total] = await Promise.all([
    User.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  sendResponse(res, 200, {
    users: users.map(sanitizeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.role = req.body.role;
  await user.save();

  sendResponse(res, 200, { user: sanitizeUser(user) }, 'User role updated');
});

const deactivateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isActive: false, refreshTokens: [] },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');

  sendResponse(res, 200, { user: sanitizeUser(user) }, 'User deactivated');
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  changePassword,
  listUsers,
  updateUserRole,
  deactivateUser,
};
