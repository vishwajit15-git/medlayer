const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const sanitize = require("./middlewares/sanitizeMiddleware");
const rateLimiter = require("./middlewares/rateLimiter");
const logger=require("./middlewares/loggerMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL, credentials: true })); // dynamic CORS
app.use(sanitize);

app.use(rateLimiter);

app.use(logger);

// Basic root route so clicking the Render link directly doesn't show a 404
app.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MedLayer API is running natively.' });
});

app.use("/", routes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

module.exports = app;