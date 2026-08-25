const mongoose = require("mongoose");
const config = require("./index");
const logger = require("../utils/logger");
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

async function connectDB() {
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await mongoose.connect(config.mongoUri, connectionOptions);

      logger.info(`MongoDB connected: ${mongoose.connection.host}`);

      mongoose.connection.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
      });
      return;
    } catch (err) {
      if (attempt === 3) {
        logger.error(
          `Failed to connect to MongoDB at the configured MONGO_URI after ${attempt} attempts: ${err.message}`,
        );
        throw err;
      }

      logger.warn(`MongoDB connection attempt ${attempt} failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };
