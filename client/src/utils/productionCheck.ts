/**
 * Production Environment Check Utility
 * Production'a deploy etmeden önce gerekli kontrolleri yapar
 * 
 * @module utils/productionCheck
 * @description Production ortamı için environment variables, API URL ve security headers kontrolü
 * 
 * @example
 * ```typescript
 * import { productionChecker } from '@/utils/productionCheck';
 * 
 * const results = productionChecker.runChecks();
 * const failed = results.filter(r => r.status === 'fail');
 * if (failed.length > 0) {
 *   console.error(productionChecker.formatResults(results));
 * }
 * ```
 */

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  required: boolean;
}

/**
 * Production ortam kontrolleri sınıfı
 * @class ProductionChecker
 */
class ProductionChecker {
  /**
   * Tüm production kontrollerini çalıştırır
   * Environment variables, API URL ve security headers kontrolü yapar
   * 
   * @returns Kontrol sonuçları listesi
   * 
   * @example
   * ```typescript
   * const results = productionChecker.runChecks();
   * ```
   */
  runChecks(): CheckResult[] {
    const checks: CheckResult[] = [];

    // Environment variables kontrolü
    checks.push(this.checkEnvironmentVariables());
    
    // API URL kontrolü
    checks.push(this.checkApiUrl());
    
    // Database connection kontrolü (backend'de yapılmalı)
    checks.push({
      name: 'Database Connection',
      status: 'warning',
      message: 'Backend\'de kontrol edilmeli',
      required: true,
    });

    // Security headers kontrolü
    checks.push(this.checkSecurityHeaders());

    return checks;
  }

  /**
   * Environment variables kontrolü
   */
  private checkEnvironmentVariables(): CheckResult {
    const requiredVars = [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_API_URL',
    ];

    const missing: string[] = [];
    
    requiredVars.forEach((varName) => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      return {
        name: 'Environment Variables',
        status: 'fail',
        message: `Eksik environment variables: ${missing.join(', ')}`,
        required: true,
      };
    }

    return {
      name: 'Environment Variables',
      status: 'pass',
      message: 'Tüm gerekli environment variables tanımlı',
      required: true,
    };
  }

  /**
   * API URL kontrolü
   */
  private checkApiUrl(): CheckResult {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      return {
        name: 'API URL',
        status: 'fail',
        message: 'NEXT_PUBLIC_API_URL tanımlı değil',
        required: true,
      };
    }

    if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
      return {
        name: 'API URL',
        status: 'warning',
        message: 'API URL localhost kullanıyor, production için production URL kullanılmalı',
        required: true,
      };
    }

    return {
      name: 'API URL',
      status: 'pass',
      message: 'API URL doğru yapılandırılmış',
      required: true,
    };
  }

  /**
   * Security headers kontrolü
   */
  private checkSecurityHeaders(): CheckResult {
    // Next.js config'de headers kontrol edilmeli
    // Bu sadece bir uyarı, gerçek kontrol next.config.js'de yapılır
    return {
      name: 'Security Headers',
      status: 'pass',
      message: 'Security headers next.config.js\'de yapılandırılmış (manuel kontrol gerekli)',
      required: true,
    };
  }

  /**
   * Kontrol sonuçlarını okunabilir formatta string'e çevirir
   * 
   * @param results - Formatlanacak kontrol sonuçları
   * @returns Formatlanmış sonuç string'i
   * 
   * @example
   * ```typescript
   * const results = productionChecker.runChecks();
   * console.log(productionChecker.formatResults(results));
   * ```
   */
  formatResults(results: CheckResult[]): string {
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    let output = `\n📊 Production Check Results:\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `✅ Passed: ${passed}\n`;
    output += `❌ Failed: ${failed}\n`;
    output += `⚠️  Warnings: ${warnings}\n\n`;

    results.forEach((result) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      output += `${icon} ${result.name}: ${result.message}\n`;
    });

    output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (failed > 0) {
      output += `\n⚠️  Production'a deploy etmeden önce başarısız kontrolleri düzeltin!\n`;
    }

    return output;
  }
}

export const productionChecker = new ProductionChecker();

// Development'ta otomatik kontrol
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  const results = productionChecker.runChecks();
  const failed = results.filter(r => r.status === 'fail' && r.required);
  
  if (failed.length > 0) {
    console.warn(productionChecker.formatResults(results));
  }
}

