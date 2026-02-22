/**
 * src/utils/logger.ts
 * Merkezi Loglama Servisi
 * 
 * Production ortamında console loglarını engellemek ve merkezi
 * bir log yönetimi sağlamak için kullanılır.
 */

const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string, data?: unknown) {
    if (isProduction) return;
    if (data !== undefined) {
      console.info(this.formatMessage('info', message), data);
    } else {
      console.info(this.formatMessage('info', message));
    }
  }

  warn(message: string, data?: unknown) {
    if (isProduction) return;
    if (data !== undefined) {
      console.warn(this.formatMessage('warn', message), data);
    } else {
      console.warn(this.formatMessage('warn', message));
    }
  }

  error(message: string, error?: unknown) {
    // Hatalar production'da external tracking aracına (Sentry vb.) gönderilebilir
    if (error !== undefined) {
      console.error(this.formatMessage('error', message), error);
    } else {
      console.error(this.formatMessage('error', message));
    }
  }

  debug(message: string, data?: unknown) {
    if (isProduction) return;
    if (data !== undefined) {
      console.debug(this.formatMessage('debug', message), data);
    } else {
      console.debug(this.formatMessage('debug', message));
    }
  }
}

export const logger = new Logger();
export default logger;
