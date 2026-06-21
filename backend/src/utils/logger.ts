import winston from 'winston';
import util from 'util';
import { env } from '../config/env';

/**
 * Application logger — use instead of console.log.
 * Logs to console + files (error.log and combined.log).
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'hms-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let metaStr = '';
          if (Object.keys(meta).length > 0) {
            try {
              metaStr = ` ${JSON.stringify(meta)}`;
            } catch (e) {
              metaStr = ` ${util.inspect(meta)}`;
            }
          }
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        }),
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
