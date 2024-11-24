const winston = require('winston');
const morgan = require('morgan');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      handleExceptions: true,
      handleRejections: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  exitOnError: false
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let output = `${timestamp} ${level}: ${message}`;
        if (meta.error?.stack) {
          output += `\n${meta.error.stack}`;
        }
        if (Object.keys(meta).length > 0 && !meta.error) {
          output += `\n${JSON.stringify(meta, null, 2)}`;
        }
        return output;
      })
    ),
    handleExceptions: true,
    handleRejections: true
  }));
}

// Custom morgan format with response time and status color
morgan.token('colored-status', (req, res) => {
  const status = res.statusCode;
  const color = status >= 500 ? 31 // red
    : status >= 400 ? 33 // yellow
    : status >= 300 ? 36 // cyan
    : status >= 200 ? 32 // green
    : 0; // no color
  return `\x1b[${color}m${status}\x1b[0m`;
});

// Create morgan middleware with detailed logging
const httpLogger = morgan(
  ':remote-addr - :method :url :colored-status :response-time[3]ms - :res[content-length] bytes - :user-agent',
  {
    stream: {
      write: (message) => logger.info(message.trim())
    },
    skip: (req, res) => {
      // Skip logging for successful health checks to reduce noise
      return req.url === '/health' && res.statusCode === 200;
    }
  }
);

module.exports = {
  logger,
  httpLogger
};
