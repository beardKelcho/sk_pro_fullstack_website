#!/usr/bin/env ts-node

/**
 * Production Check Script
 * Production'a deploy etmeden önce çalıştırılmalı
 */

import { productionChecker } from '../src/utils/productionCheck';

console.log('🔍 Production Check Başlatılıyor...\n');

const results = productionChecker.runChecks();
const output = productionChecker.formatResults(results);

console.log(output);

const failed = results.filter(r => r.status === 'fail' && r.required);
const warnings = results.filter(r => r.status === 'warning' && r.required);

if (failed.length > 0) {
  console.error('\n❌ Production\'a deploy etmeden önce başarısız kontrolleri düzeltin!');
  process.exit(1);
} else if (warnings.length > 0) {
  console.warn('\n⚠️  Uyarılar var, ancak production\'a deploy edilebilir.');
  process.exit(0);
} else {
  console.log('\n✅ Tüm kontroller başarılı! Production\'a deploy edilebilir.');
  process.exit(0);
}

