import winston from "winston";

// Define a logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

class errorHandler extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "Fail" : "Error";
    this.isOperational = true;

    // Log the error message using the logger
    logger.error(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = errorHandler;
