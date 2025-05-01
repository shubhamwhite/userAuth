const config = require('../config'); // Adjust the path as needed

const errorHandler = (err, req, res, next) => { 
  const nodeEnv = config.get('DEBUG_MODE'); // Fetch NODE_ENV using the config file

  // Log the error stack trace for debugging in development
  if (nodeEnv === 'true') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Send the error response
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(nodeEnv === 'true' && { stack: err.stack }), 
  });
}

module.exports = errorHandler;