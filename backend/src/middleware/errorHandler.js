const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return errorResponse(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists`, 409);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError')
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400);

  // JWT errors
  if (err.name === 'JsonWebTokenError') return errorResponse(res, 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return errorResponse(res, 'Token expired', 401);

  return errorResponse(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
