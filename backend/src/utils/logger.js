import winston from 'winston';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'playbeat-api' },
  format: combine(
    timestamp(),
    errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ] : []),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
});
