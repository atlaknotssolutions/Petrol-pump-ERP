require("dotenv").config();

const readEnv = (key, fallback) => {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
};

const config = {
  env: readEnv("NODE_ENV", "development"),
  port: parseInt(readEnv("PORT", "8000"), 10) || 8000,

  corsOrigin: (readEnv("CORS_ORIGIN", "*") || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  jwt: {
    accessSecret: readEnv("JWT_ACCESS_SECRET", "dev_access_secret_change_me"),
  },

  rateLimit: {
    windowMs: parseInt(readEnv("RATE_LIMIT_WINDOW_MS", "60000"), 10) || 60000,
    max: parseInt(readEnv("RATE_LIMIT_MAX", "300"), 10) || 300,
  },

  proxyTimeoutMs: parseInt(readEnv("PROXY_TIMEOUT_MS", "15000"), 10) || 15000,
};

if (config.env === "production") {
  const required = ["JWT_ACCESS_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

module.exports = config;
