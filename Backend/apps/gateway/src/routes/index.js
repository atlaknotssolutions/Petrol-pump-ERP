const express = require('express');
const services = require('../config/services');
const gatewayAuth = require('../middlewares/auth.middleware');
const { apiLimiter, authLimiter } = require('../middlewares/rateLimiter');
const { buildServiceProxy } = require('../utils/proxy');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Aggregated health check — pings every downstream service's /health
 * endpoint in parallel and reports overall gateway + services status.
 */
router.get('/health', async (_req, res) => {
  const checks = await Promise.all(
    services
      .filter((svc, idx, arr) => arr.findIndex((s) => s.target === svc.target) === idx) // dedupe same target
      .map(async (svc) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const resp = await fetch(`${svc.target}/health`, { signal: controller.signal });
          clearTimeout(timeout);
          return { service: svc.name, status: resp.ok ? 'up' : 'degraded' };
        } catch (err) {
          return { service: svc.name, status: 'down', error: err.message };
        }
      })
  );

  const allUp = checks.every((c) => c.status === 'up');

  res.status(allUp ? 200 : 503).json({
    status: allUp ? 'ok' : 'degraded',
    gateway: 'up',
    timestamp: new Date(),
    services: checks,
  });
});

// Mount each downstream service behind: rate limiting -> auth -> proxy
services.forEach((service) => {
  const limiter = service.prefix === '/api/v1/auth' ? authLimiter : apiLimiter;
  const proxy = buildServiceProxy(service);

  router.use(service.prefix, limiter, gatewayAuth, proxy);
  logger.info(`Mounted ${service.name} at ${service.prefix} -> ${service.target}`);
});

module.exports = router;
