/**
 * Server-side Logger Utility
 * Winston kullanarak structured logging sağlar
 * Production'da dosyaya, development'ta console'a yazar
 */

import winston from 'winston';
import path from 'path';

/**
 * Log formatı (JSON formatında structured logging)
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console formatı (development için)
 * Renkli ve okunabilir format
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

/**
 * Winston logger instance
 * - Error logları: logs/error.log
 * - Tüm loglar: logs/combined.log
 * - Development: Console'a da yazar
 * - Production: Sadece warn ve error console'a yazar
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sk-production-api' },
  transports: [
    // Hata logları için ayrı dosya
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Tüm loglar için dosya
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Development ortamında console'a da yazdır
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Production'da sadece warn ve error seviyelerini console'a yazdır
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'warn',
    })
  );
}

export default logger;

