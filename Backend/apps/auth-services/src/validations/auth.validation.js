const Joi = require('joi');

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.pattern.base':
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    'string.min': 'Password must be at least 8 characters long',
  });

const register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password,
});

const login = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const logout = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPassword = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetPassword = Joi.object({
  token: Joi.string().required(),
  password,
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
});

const updateRole = Joi.object({
  role: Joi.string().valid('user', 'admin', 'superadmin').required(),
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateRole,
};
