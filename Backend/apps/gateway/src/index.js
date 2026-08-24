const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

let server;

function start() {
  server = app.listen(config.port, () => {
    logger.info(`gateway running in ${config.env} mode on port ${config.port}`);
  });
}

function shutdown(signal) {
  return () => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    if (server) {
      server.close(() => {
        logger.info('Server closed. Process terminated.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };
}

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  throw reason;
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

start();
