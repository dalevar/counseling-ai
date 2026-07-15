import winston from 'winston';
import path from 'path';

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const transports: winston.transport[] = [];
const logsDirectory = path.resolve(process.cwd(), 'logs');

// ===============================
// Production (Vercel)
// ===============================
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({
          stack: true,
        }),
        winston.format.json(),
      ),
    }),
  );
}

// ===============================
// Development (Local)
// ===============================
else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat,
      ),
    }),
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
      level: 'error',
    }),
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDirectory, 'combined.log'),
    }),
  );
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({
      stack: true,
    }),
    winston.format.splat(),
    winston.format.json(),
  ),

  defaultMeta: {
    service: 'educouns-backend',
  },

  transports,
});
