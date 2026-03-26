const express = require("express");
const routes = require("./routes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const sanitize = require("./middlewares/sanitizeMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");
const logger=require("./middlewares/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());
app.use(sanitize);

app.use(rateLimiter);

app.use(logger)
app.use("/", routes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

module.exports = app;