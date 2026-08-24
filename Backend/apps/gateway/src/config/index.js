require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  corsOrigin: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },

  proxyTimeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 15000,
};

if (config.env === 'production') {
  const required = ['JWT_ACCESS_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = config;
