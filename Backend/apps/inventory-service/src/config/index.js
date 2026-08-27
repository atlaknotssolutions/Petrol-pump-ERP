require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 8003,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_service',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  gatewaySharedSecret: process.env.GATEWAY_SHARED_SECRET,
  branchServiceUrl: process.env.BRANCH_SERVICE_URL || 'http://localhost:8002',
  branchIsolationEnabled: process.env.BRANCH_ISOLATION_ENABLED === 'true',
  branchMongoUri: process.env.BRANCH_MONGO_URI || null,
};

if (config.env === 'production') {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI is required in production');
  }
  if (!config.gatewaySharedSecret) {
    throw new Error('GATEWAY_SHARED_SECRET is required in production');
  }
}

module.exports = config;
