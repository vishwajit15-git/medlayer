const express = require("express");
const routes = require("./routes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const sanitize = require("./middlewares/sanitizeMiddleware");

const app = express();

app.use(express.json());
app.use(sanitize);

app.use("/", routes);

app.use(errorMiddleware);

module.exports = app;