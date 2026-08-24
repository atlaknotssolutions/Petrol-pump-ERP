const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Sign a short-lived access token carrying identity + authorization claims.
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      type: 'access',
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

/**
 * Sign a long-lived refresh token. Kept minimal on purpose — no roles/perms,
 * since those can change and the refresh token should not carry stale claims.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), type: 'refresh', jti: crypto.randomUUID() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
}

async function generateAuthTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Persist refresh token so it can be revoked on logout / reused-token detection
  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
}

async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const tokens = await generateAuthTokens(user);
  return { user, tokens };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  user.lastLoginAt = new Date();
  const tokens = await generateAuthTokens(user);

  return { user, tokens };
}

async function refreshAuthTokens(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'Invalid token type');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    // Token reuse / revoked token — treat as compromised
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  // Rotate: remove old, issue new
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  const tokens = await generateAuthTokens(user);

  return { user, tokens };
}

async function logoutUser(userId, refreshToken) {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;

  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save({ validateBeforeSave: false });
}

async function logoutAllSessions(userId) {
  await User.findByIdAndUpdate(userId, { refreshTokens: [] });
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all other sessions
  await user.save();

  return user;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  registerUser,
  loginUser,
  refreshAuthTokens,
  logoutUser,
  logoutAllSessions,
  changePassword,
};
