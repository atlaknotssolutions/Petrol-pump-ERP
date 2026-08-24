require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/auth_service',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// Fail fast if critical secrets are missing in production
if (config.env === 'production') {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = config;
