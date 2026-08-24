const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config');
const routes = require('./routes');
const { errorConverter, errorHandler, notFound } = require('./middlewares');
const logger = require('./utils/logger');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging routed through winston
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service', timestamp: new Date() });
});

// API routes
app.use('/api/v1', routes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
