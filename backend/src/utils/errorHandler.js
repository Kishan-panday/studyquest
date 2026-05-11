/**
 * Logger utility for backend
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || "INFO"] || LOG_LEVELS.INFO;

export const logger = {
  error: (message, error) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || "");
    }
  },
  warn: (message) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  },
  info: (message) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  },
  debug: (message) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
};

/**
 * Error handling middleware
 */
export function errorHandler(err, _req, res, _next) {
  logger.error("An error occurred", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
