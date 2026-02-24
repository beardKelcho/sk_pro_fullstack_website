const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Başlıyor: Tüm platformlar için Build süreci...\n');

try {
    // 1. Next.js Static Export
    console.log('📦 1. Next.js Static Build Alınıyor...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Next.js Build Başarılı!\n');

    // Dosya mevcut mu kontrol edelim (out klasörü oluştu mu)
    if (!fs.existsSync('./out')) {
        throw new Error('out/ klasörü bulunamadı. Build başarısız olmuş olabilir.');
    }

    // 2. Capacitor (Mobil)
    console.log('📱 2. Capacitor (Mobil) Senkronizasyonu Yapılıyor...');
    execSync('npx cap sync', { stdio: 'inherit' });
    console.log('✅ Capacitor Senkronizasyonu Başarılı!\n');

    // 3. Electron (Masaüstü)
    console.log('🖥️ 3. Electron (Masaüstü) Uygulaması Paketleniyor...');
    execSync('npm run electron:build', { stdio: 'inherit' });
    console.log('✅ Electron Paketleme Başarılı!\n');

    console.log('🎉 TÜM İŞLEMLER BAŞARIYLA TAMAMLANDI!');
} catch (error) {
    console.error('\n❌ BUILD SIRASINDA HATA OLUŞTU:');
    console.error(error.message);
    process.exit(1);
}
