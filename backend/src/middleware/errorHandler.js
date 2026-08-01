import { logger } from '../utils/logger.js';

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming or unknown errors - don't leak details
  logger.error(`UNEXPECTED ERROR: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
};

export const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { AppError };
