/**
 * Bundle Size Check Script
 * Build sonrası bundle boyutlarını kontrol eder ve performance budget'ları doğrular
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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
const APP_BUILD_MANIFEST = path.join(BUILD_DIR, 'app-build-manifest.json');
const BUILD_ID_FILE = path.join(BUILD_DIR, 'BUILD_ID');

const IGNORED_BUDGET_ROUTES = new Set([
  '/_error',
  '/_not-found',
  '/global-error',
  '/not-found',
  '/layout',
  '/error',
  '/loading',
  '/admin/layout',
  '/admin/loading',
]);

const SHARED_CHUNK_USAGE_THRESHOLD = 0.95;

/**
 * Build manifest'i oku
 */
function readBuildManifest(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest;
  } catch (error) {
    return null;
  }
}

/**
 * Dosya boyutunu KB cinsinden hesapla
 */
function getFileSize(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return zlib.gzipSync(fileBuffer).length / 1024; // KB (gzip)
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
 * Route label'ini rapor için normalize et
 */
function normalizeRouteLabel(route) {
  if (route === '/page') {
    return '/';
  }

  return route.replace(/\/page$/, '').replace(/\/route$/, '');
}

/**
 * Build asset yolunu çöz
 */
function resolveBuildAssetPath(assetPath) {
  return path.join(BUILD_DIR, assetPath.replace(/^\/+/, ''));
}

/**
 * Budget hesabından hariç tutulacak route'ları belirle
 */
function shouldCheckRouteBudget(route) {
  if (IGNORED_BUDGET_ROUTES.has(route)) {
    return false;
  }

  if (route.startsWith('/api/')) {
    return false;
  }

  if (route === '/robots.txt' || route === '/sitemap.xml') {
    return false;
  }

  return true;
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

  const manifests = [readBuildManifest(BUILD_MANIFEST), readBuildManifest(APP_BUILD_MANIFEST)].filter(Boolean);
  if (manifests.length === 0) {
    console.error('❌ Build manifest bulunamadı. Önce build yapın: npm run build');
    process.exit(1);
  }
  const results = {
    pages: {},
    shared: {},
    total: {
      js: 0,
      css: 0,
    },
    routeCount: 0,
    warnings: [],
    errors: [],
  };

  const routeFiles = {};
  manifests.forEach((manifest) => {
    Object.entries(manifest.pages || {}).forEach(([page, files]) => {
      if (page === '/_app' || page === '/_document') return;
      if (!Array.isArray(files)) return;

      const route = normalizeRouteLabel(page);
      const routeAssetFiles = Array.from(
        new Set(files.filter((file) => file.endsWith('.js') || file.endsWith('.css')))
      );

      if (!routeFiles[route]) {
        routeFiles[route] = new Set();
      }

      routeAssetFiles.forEach((file) => {
        routeFiles[route].add(file);
      });
    });
  });

  const normalizedRoutes = Object.keys(routeFiles);
  results.routeCount = normalizedRoutes.length;

  if (normalizedRoutes.length === 0) {
    console.error('❌ Analiz edilecek route bulunamadı. Build çıktısını kontrol edin.');
    process.exit(1);
  }

  const fileUsageCounts = new Map();

  normalizedRoutes.forEach((route) => {
    routeFiles[route].forEach((file) => {
      fileUsageCounts.set(file, (fileUsageCounts.get(file) || 0) + 1);
    });
  });

  const minSharedUsageCount = Math.max(1, Math.floor(normalizedRoutes.length * SHARED_CHUNK_USAGE_THRESHOLD));
  const globalSharedFiles = new Set(
    [...fileUsageCounts.entries()]
      .filter(([, usageCount]) => usageCount >= minSharedUsageCount)
      .map(([file]) => file)
  );

  globalSharedFiles.forEach((file) => {
    results.shared[file] = getFileSize(resolveBuildAssetPath(file));
  });

  normalizedRoutes.forEach((route) => {
    const pageSize = {
      js: 0,
      css: 0,
      firstLoadJS: 0,
      firstLoadCSS: 0,
      files: [],
    };

    routeFiles[route].forEach((file) => {
      if (globalSharedFiles.has(file)) {
        return;
      }

      const size = getFileSize(resolveBuildAssetPath(file));
      const fileKind = file.endsWith('.css') ? 'css' : 'js';

      pageSize[fileKind] += size;
      pageSize.files.push({ file, size, scope: 'page' });
    });

    results.pages[route] = pageSize;
  });

  const sharedJS = Object.entries(results.shared)
    .filter(([file]) => file.endsWith('.js'))
    .reduce((sum, [, size]) => sum + size, 0);
  const sharedCSS = Object.entries(results.shared)
    .filter(([file]) => file.endsWith('.css'))
    .reduce((sum, [, size]) => sum + size, 0);

  const maxPageJS = Math.max(0, ...Object.values(results.pages).map((page) => page.js));
  const maxPageCSS = Math.max(0, ...Object.values(results.pages).map((page) => page.css));

  Object.values(results.pages).forEach((page) => {
    page.firstLoadJS = sharedJS + page.js;
    page.firstLoadCSS = sharedCSS + page.css;
  });

  results.total.js = sharedJS + maxPageJS;
  results.total.css = sharedCSS + maxPageCSS;

  return results;
}

/**
 * Performance budget kontrolü
 */
function checkPerformanceBudget(results) {
  const warnings = [];
  const errors = [];

  // Shared JS kontrolü
  const sharedJSSize = Object.entries(results.shared)
    .filter(([file]) => file.endsWith('.js'))
    .reduce((sum, [, size]) => sum + size, 0);

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
    if (!shouldCheckRouteBudget(page)) {
      return;
    }

    const pageSize = results.pages[page];
    if (pageSize.js > PERFORMANCE_BUDGET.pageJS) {
      const diff = pageSize.js - PERFORMANCE_BUDGET.pageJS;
      warnings.push(
        `⚠️  ${page} JS budget aşıldı: ${pageSize.js.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.pageJS} KB, fazla: ${diff.toFixed(2)} KB)`
      );
    }

    if (pageSize.firstLoadJS > PERFORMANCE_BUDGET.firstLoadJS) {
      const diff = pageSize.firstLoadJS - PERFORMANCE_BUDGET.firstLoadJS;
      warnings.push(
        `⚠️  ${page} First Load JS budget aşıldı: ${pageSize.firstLoadJS.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.firstLoadJS} KB, fazla: ${diff.toFixed(2)} KB)`
      );
    }
  });

  // Worst-case first load JS kontrolü
  if (results.total.js > PERFORMANCE_BUDGET.totalJS) {
    const diff = results.total.js - PERFORMANCE_BUDGET.totalJS;
    errors.push(
      `❌ En yüksek First Load JS budget aşıldı: ${results.total.js.toFixed(2)} KB (limit: ${PERFORMANCE_BUDGET.totalJS} KB, fazla: ${diff.toFixed(2)} KB)`
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
  console.log(`🧭 Analiz edilen route sayısı: ${results.routeCount}\n`);

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
    console.log(`      First Load JS: ${pageSize.firstLoadJS.toFixed(2)} KB`);
    if (pageSize.files.length > 0) {
      pageSize.files.forEach(({ file, size }) => {
        console.log(`         - ${file}: ${size.toFixed(2)} KB`);
      });
    }
  });
  console.log('');

  // Worst-case summary
  console.log('📊 Worst-Case First Load:');
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
  } else if (warnings.length > 0) {
    console.log('⚠️  Performance budget uyarıları var, ama bloklayıcı bir hata yok.');
    console.log('');
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

module.exports = { analyzeBundles, checkPerformanceBudget, PERFORMANCE_BUDGET, shouldCheckRouteBudget };
