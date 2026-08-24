require("dotenv").config();

const readEnv = (key, fallback) => {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
};

const config = {
  env: readEnv("NODE_ENV", "development"),
  port: parseInt(readEnv("PORT", "4000"), 10) || 4000,

  mongoUri: readEnv("MONGO_URI", "mongodb://localhost:27017/auth_service"),

  jwt: {
    accessSecret: readEnv("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
    refreshSecret: readEnv(
      "JWT_REFRESH_SECRET",
      "dev_refresh_secret_change_me",
    ),
    accessExpiresIn: readEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
    refreshExpiresIn: readEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  bcryptSaltRounds: parseInt(readEnv("BCRYPT_SALT_ROUNDS", "10"), 10) || 10,

  corsOrigin: readEnv("CORS_ORIGIN", "*"),
};

// Fail fast if critical secrets are missing in production
if (config.env === "production") {
  const required = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "MONGO_URI"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

module.exports = config;
