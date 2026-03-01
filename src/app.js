const express = require("express");
const routes = require("./routes");
const {errorMiddleware} = require("./middlewares/errorMiddleware");

const app = express();

app.use(express.json());

// prefix all APIs
app.use("/", routes);

// error handler at bottom
app.use(errorMiddleware);

module.exports = app;