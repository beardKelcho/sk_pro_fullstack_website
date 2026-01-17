/**
 * Server-side Logger Utility
 * Winston kullanarak structured logging sağlar
 * Production'da dosyaya, development'ta console'a yazar
 */

import winston from 'winston';
import path from 'path';
import { getRequestId } from './requestContext';
import fs from 'fs';

const isProd = process.env.NODE_ENV === 'production';

const ensureLogsDir = () => {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
};

/**
 * Log formatı (JSON formatında structured logging)
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format((info) => {
    const rid = getRequestId();
    if (rid) {
      (info as any).requestId = rid;
    }
    return info;
  })(),
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
    const requestId = (meta as any).requestId ? ` rid=${(meta as any).requestId}` : '';
    // requestId'yi meta içinden çıkartıp tekrar yazdırmayalım
    if ((meta as any).requestId) delete (meta as any).requestId;
    let msg = `${timestamp} [${level}]${requestId}: ${message}`;
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
const consoleTransportFormat = process.env.LOG_CONSOLE_FORMAT === 'json' ? logFormat : consoleFormat;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sk-production-api' },
  transports: [
    // Hata logları için ayrı dosya
    new winston.transports.File({
      filename: path.join(ensureLogsDir(), 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Tüm loglar için dosya
    new winston.transports.File({
      filename: path.join(ensureLogsDir(), 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Development ortamında console'a da yazdır
if (!isProd) {
  logger.add(
    new winston.transports.Console({
      format: consoleTransportFormat,
    })
  );
}

// Production'da stdout/stderr üzerinden log aggregation daha sağlıklı.
// Default: info ve üzeri; LOG_LEVEL ile değiştirilebilir.
if (isProd) {
  logger.add(
    new winston.transports.Console({
      format: consoleTransportFormat,
      level: process.env.LOG_LEVEL || 'info',
    })
  );
}

export default logger;

