require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8004,

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/sales_service',

  corsOrigin: process.env.CORS_ORIGIN || '*',

  gatewaySharedSecret: process.env.GATEWAY_SHARED_SECRET,
};

if (config.env === 'production') {
  const required = ['MONGO_URI', 'GATEWAY_SHARED_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = config;
