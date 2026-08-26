const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const config = require("./config");
const routes = require("./routes");
const { errorConverter, errorHandler, notFound } = require("./middlewares");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

const healthResponse = (_req, res) => {
  res
    .status(200)
    .json({ status: "ok", service: "sales-service", timestamp: new Date() });
};

app.get("/health", healthResponse);
app.get("/ping", healthResponse);

app.use("/api/v1/sales", routes);

app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
