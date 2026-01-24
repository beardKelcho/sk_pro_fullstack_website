/**
 * Client-side Logger Utility
 * Production'da console.log'ları temizler, development'ta gösterir
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Client-side logger class
 * Production'da sadece warn ve error seviyelerini gösterir
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Belirli bir log seviyesinin gösterilip gösterilmeyeceğini kontrol eder
   * @param level - Log seviyesi
   * @returns Log gösterilmeli mi?
   */
  private shouldLog(level: LogLevel): boolean {
    // Development'ta her şeyi göster
    if (this.isDevelopment) {
      return true;
    }

    // Production'da sadece warn ve error göster
    return level === 'warn' || level === 'error';
  }

  /**
   * Debug seviyesinde log yazdırır
   * @param args - Log mesajları
   */
  /**
   * Debug seviyesinde log yazdırır
   * @param args - Log mesajları
   */
  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info seviyesinde log yazdırır
   * @param args - Log mesajları
   */
  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warning seviyesinde log yazdırır
   * @param args - Log mesajları
   */
  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error seviyesinde log yazdırır
   * @param args - Log mesajları
   */
  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * Genel log yazdırır (info seviyesi kullanır)
   * @param args - Log mesajları
   */
  log(...args: unknown[]): void {
    // log() için info seviyesini kullan
    this.info(...args);
  }
}

// Singleton instance
export const logger = new Logger();

// Default export
export default logger;

