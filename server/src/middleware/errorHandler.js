const { ZodError } = require('zod');
const env = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this unique value already exists.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested resource was not found.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired or invalid. Please log in again.';
  }

  if (statusCode >= 500 && env.nodeEnv === 'production') {
    message = 'An unexpected server error occurred.';
    details = undefined;
  }

  if (env.nodeEnv !== 'test') {
    console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

module.exports = errorHandler;
