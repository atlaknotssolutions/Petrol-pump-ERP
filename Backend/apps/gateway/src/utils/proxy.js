const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Builds a configured proxy middleware for a single downstream service
 * definition (see config/services.js).
 */
function buildServiceProxy(service) {
  // The proxy layer receives req.url already stripped of the router mounts
  // (e.g. '/login' for GET /api/v1/auth/login). Downstream services expose
  // their routes under the full public path ('/api/v1/auth/...'), so the
  // service's registry prefix is re-prepended here.
  const mountRoot = service.prefix.startsWith('/api/v1')
    ? service.prefix
    : `/api/v1${service.prefix}`;

  return createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: { '^/': `${mountRoot}/` },
    timeout: config.proxyTimeoutMs,
    proxyTimeout: config.proxyTimeoutMs,
    logger: {
      info: (msg) => logger.info(`[proxy:${service.name}] ${msg}`),
      warn: (msg) => logger.warn(`[proxy:${service.name}] ${msg}`),
      error: (msg) => logger.error(`[proxy:${service.name}] ${msg}`),
    },
    on: {
      proxyReq: (proxyReq, req) => {
        // Re-attach JSON body for POST/PUT/PATCH — express.json() already
        // consumed the stream, so http-proxy-middleware needs it rewritten.
        if (req.body && Object.keys(req.body).length) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        logger.error(`[proxy:${service.name}] ${err.message}`);
        if (res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              message: `${service.name} is currently unavailable. Please try again shortly.`,
            })
          );
        }
      },
    },
  });
}

module.exports = { buildServiceProxy };
