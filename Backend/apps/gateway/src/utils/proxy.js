const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Builds a configured proxy middleware for a single downstream service
 * definition (see config/services.js).
 */
function buildServiceProxy(service) {
  return createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: service.pathRewrite,
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
