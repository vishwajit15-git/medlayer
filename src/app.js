const express = require("express");
const routes = require("./routes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const sanitize = require("./middlewares/sanitizeMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");

const app = express();

app.use(express.json());
app.use(sanitize);

app.use(rateLimiter);

app.use("/", routes);

app.use(errorMiddleware);

module.exports = app;