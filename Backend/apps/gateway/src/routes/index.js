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
//
// This router is mounted at /api/v1 in app.js, so Express strips that root
// from req.url before matching layers here. Registry prefixes are stored as
// full public paths (e.g. '/api/v1/auth'), therefore they must be re-based
// to be router-relative ('/auth') or the layer can never match and every
// proxied request falls through to the 404 handler.
const API_ROOT = '/api/v1';

services.forEach((service) => {
  const limiter = service.prefix === '/api/v1/auth' ? authLimiter : apiLimiter;
  const proxy = buildServiceProxy(service);

  const mountPath = service.prefix.startsWith(API_ROOT)
    ? service.prefix.slice(API_ROOT.length) || '/'
    : service.prefix;

  router.use(mountPath, limiter, gatewayAuth, proxy);
  logger.info(`Mounted ${service.name} at ${mountPath} (${service.prefix}) -> ${service.target}`);
});

module.exports = router;
