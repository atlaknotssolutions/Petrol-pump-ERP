const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config');
const routes = require('./routes');
const { errorConverter, errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // needed for correct req.ip behind LB / reverse proxy

// Security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin.includes('*') ? '*' : config.corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging routed through winston
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Root-level health check (gateway process itself, no downstream calls)
app.get('/ping', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'gateway', timestamp: new Date() });
});

// Routes: aggregated /api/v1/health + proxied service routes
app.use('/api/v1', routes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
