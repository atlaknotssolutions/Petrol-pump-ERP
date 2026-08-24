const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const { Schema } = mongoose;

const ROLES = ['user', 'admin', 'superadmin'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'user',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
    passwordChangedAt: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Instance method: compare plaintext password against the hash
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Instance method: check if password was changed after a given JWT iat
userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtTimestamp < changedTimestamp;
};

// Instance method: has a specific permission (directly or via role)
userSchema.methods.hasPermission = function hasPermission(permission) {
  if (this.role === 'superadmin') return true;
  return this.permissions.includes(permission);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
