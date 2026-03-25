const ExpressError = require("../utils/ExpressError");

const errorMiddleware=(err, req, res, next) => {

  console.error({
    message: err.message,
    status: err.statusCode || 500,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user ? req.user.id : "anonymous"
  });

  if (err.code === 11000){
    return res.status(409).json({
      message: "Duplicate field value (unique constraint violated)"
    });
  }

  if(err.name === "ValidationError"){
    return res.status(400).json({
      message: Object.values(err.errors).map(e => e.message).join(", ")
    });
  }

  if(err instanceof ExpressError && err.isOperational){
    return res.status(err.statusCode).json({
      message: err.message
    });
  }
  return res.status(500).json({
    message: "Something went wrong"
  });
};

module.exports = { errorMiddleware };