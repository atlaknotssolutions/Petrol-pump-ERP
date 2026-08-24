const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(config.mongoUri);

    logger.info(`MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
