/**
 * Bundle Size Check Script
 * Build sonrası bundle boyutlarını kontrol eder ve performance budget'ları doğrular
 */

const fs = require('fs');
const path = require('path');

// Performance Budget (KB cinsinden)
const PERFORMANCE_BUDGET = {
  // First Load JS (tüm sayfalar için)
  firstLoadJS: 200, // 200 KB
  
  // Shared JS (tüm sayfalar için ortak)
  sharedJS: 150, // 150 KB
  
  // Page-specific JS (her sayfa için)
  pageJS: 100, // 100 KB
  
  // Total JS (firstLoad + shared + page)
  totalJS: 300, // 300 KB
  
  // CSS
  css: 50, // 50 KB
  
  // Images (her resim için)
  image: 500, // 500 KB
};

// Build output klasörü
const BUILD_DIR = path.join(__dirname, '..', '.next');

// Build manifest dosyası
const BUILD_MANIFEST = path.join(BUILD_DIR, 'build-manifest.json');
const BUILD_ID_FILE = path.join(BUILD_DIR, 'BUILD_ID');

/**
 * Build manifest'i oku
 */
function readBuildManifest() {
  try {
    const manifest = JSON.parse(fs.readFileSync(BUILD_MANIFEST, 'utf8'));
    return manifest;
  } catch (error) {
    console.error('❌ Build manifest okunamadı:', error.message);
    return null;
  }
}

/**
 * Dosya boyutunu KB cinsinden hesapla
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size / 1024; // KB
  } catch (error) {
    return 0;
  }
}

/**
 * Build ID'yi oku
 */
function getBuildId() {
  try {
    return fs.readFileSync(BUILD_ID_FILE, 'utf8').trim();
  } catch (error) {
    return null;
  }
}

/**
 * Bundle dosyalarını analiz et
 */
function analyzeBundles() {
  const buildId = getBuildId();
  if (!buildId) {
    console.error('❌ Build ID bulunamadı. Önce build yapın: npm run build');
    process.exit(1);
  }

  const manifest = readBuildManifest();
  if (!manifest) {
    console.error('❌ Build manifest bulunamadı. Önce build yapın: npm run build');
    process.exit(1);
  }

  const staticDir = path.join(BUILD_DIR, 'static');
  const chunksDir = path.join(staticDir, 'chunks');
  
  const results = {
    pages: {},
    shared: {},
    total: {
      js: 0,
      css: 0,
    },
    warnings: [],
    errors: [],
  };

  // Shared chunks
  if (manifest.pages['/_app']) {
    manifest.pages['/_app'].forEach((file) => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const size = getFileSize(filePath);
        results.shared[file] = size;
        results.total.js += size;
      } else if (file.endsWith('.css')) {
        const filePath = path.join(chunksDir, file);
        const size = getFileSize(filePath);
        results.shared[file] = size;
        results.total.css += size;
      }
    });
  }

  // Page-specific chunks
  Object.keys(manifest.pages).forEach((page) => {
    if (page === '/_app' || page === '/_document') return;

    const pageFiles = manifest.pages[page] || [];
    const pageSize = {
      js: 0,
      css: 0,
      files: [],
    };

    pageFiles.forEach((file) => {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file);
        const size = getFileSize(filePath);
        pageSize.js += size;
        pageSize.files.push({ file, size });
        results.total.js += size;
      } else if (file.endsWith('.css')) {
        const filePath = path.join(chunksDir, file);
        const size = getFileSize(filePath);
        pageSize.css += size;
        pageSize.files.push({ file, size });
        results.total.css += size;
      }
    });

    results.pages[page] = pageSize;
  });

  return results;
}

/**
 * Performance budget kontrolü
 */
function checkPerformanceBudget(results) {
  const warnings = [];
  const errors = [];

  // Shared JS kontrolü
  const sharedJSSize = Object.values(results.shared)
    .filter((size, index) => Object.keys(results.shared)[index].endsWith('.js'))
    .reduce((sum, size) => sum + size, 0);

  if (sharedJSSize > PERFORMANCE_BUDGET.sharedJS) {
    const diff = sharedJSSize - PERFORMANCE_BUDGET.sharedJS;
    errors.push(
      `❌ Shared JS budget aşıldı: ${sharedJSSize.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.sharedJS} KB, fazla: ${diff.toFixed(2)} KB)`
    );
  }

  // CSS kontrolü
  if (results.total.css > PERFORMANCE_BUDGET.css) {
    const diff = results.total.css - PERFORMANCE_BUDGET.css;
    warnings.push(
      `⚠️  CSS budget aşıldı: ${results.total.css.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.css} KB, fazla: ${diff.toFixed(2)} KB)`
    );
  }

  // Page-specific JS kontrolü
  Object.keys(results.pages).forEach((page) => {
    const pageSize = results.pages[page];
    if (pageSize.js > PERFORMANCE_BUDGET.pageJS) {
      const diff = pageSize.js - PERFORMANCE_BUDGET.pageJS;
      warnings.push(
        `⚠️  ${page} JS budget aşıldı: ${pageSize.js.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.pageJS} KB, fazla: ${diff.toFixed(2)} KB)`
      );
    }
  });

  // Total JS kontrolü
  if (results.total.js > PERFORMANCE_BUDGET.totalJS) {
    const diff = results.total.js - PERFORMANCE_BUDGET.totalJS;
    errors.push(
      `❌ Total JS budget aşıldı: ${results.total.js.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.totalJS} KB, fazla: ${diff.toFixed(2)} KB)`
    );
  }

  return { warnings, errors };
}

/**
 * Rapor oluştur
 */
function generateReport(results) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Bundle Size Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Shared chunks
  console.log('📦 Shared Chunks:');
  Object.keys(results.shared).forEach((file) => {
    const size = results.shared[file];
    const type = file.endsWith('.js') ? 'JS' : 'CSS';
    console.log(`   ${type}: ${file} - ${size.toFixed(2)} KB`);
  });
  console.log('');

  // Page-specific chunks
  console.log('📄 Page-Specific Chunks:');
  Object.keys(results.pages).forEach((page) => {
    const pageSize = results.pages[page];
    console.log(`   ${page}:`);
    console.log(`      JS: ${pageSize.js.toFixed(2)} KB`);
    console.log(`      CSS: ${pageSize.css.toFixed(2)} KB`);
    if (pageSize.files.length > 0) {
      pageSize.files.forEach(({ file, size }) => {
        console.log(`         - ${file}: ${size.toFixed(2)} KB`);
      });
    }
  });
  console.log('');

  // Total
  console.log('📊 Total:');
  console.log(`   JS: ${results.total.js.toFixed(2)} KB`);
  console.log(`   CSS: ${results.total.css.toFixed(2)} KB`);
  console.log(`   Total: ${(results.total.js + results.total.css).toFixed(2)} KB`);
  console.log('');

  // Performance budget kontrolü
  const { warnings, errors } = checkPerformanceBudget(results);

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warning) => console.log(`   ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach((error) => console.log(`   ${error}`));
    console.log('');
    console.log('💡 İyileştirme önerileri:');
    console.log('   • Code splitting kullanın');
    console.log('   • Lazy loading ekleyin');
    console.log('   • Kullanılmayan kütüphaneleri kaldırın');
    console.log('   • Tree shaking yapın');
    console.log('');
    process.exit(1);
  } else {
    console.log('✅ Tüm performance budget\'lar karşılanıyor!');
    console.log('');
  }
}

// Ana fonksiyon
function main() {
  console.log('🔍 Bundle size kontrolü başlatılıyor...\n');

  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Build klasörü bulunamadı. Önce build yapın: npm run build');
    process.exit(1);
  }

  const results = analyzeBundles();
  generateReport(results);
}

// Script çalıştır
if (require.main === module) {
  main();
}

module.exports = { analyzeBundles, checkPerformanceBudget, PERFORMANCE_BUDGET };

