#!/usr/bin/env node

/**
 * ngrok Başlatma Script'i
 * Backend server'ı ngrok ile internet üzerinden erişilebilir hale getirir
 */

const ngrok = require('ngrok');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// .env dosyasını manuel olarak oku (dotenv bağımlılığı olmadan)
function loadEnv() {
  const envPath = path.join(__dirname, '../server/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnv();

const PORT = parseInt(process.env.PORT || '5001', 10);
const AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;
const SUBDOMAIN = process.env.NGROK_SUBDOMAIN;
const REGION = process.env.NGROK_REGION || 'us';
const CLOUD_ENDPOINT_URL = process.env.NGROK_CLOUD_ENDPOINT_URL; // Cloud endpoint URL (örn: https://default.internal)

async function startNgrok() {
  // Önce tüm ngrok süreçlerini öldür
  console.log('🛑 Mevcut ngrok süreçlerini temizliyorum...');
  try {
    const { execSync } = require('child_process');
    try {
      execSync('pkill -9 -f ngrok', { stdio: 'ignore' });
      console.log('   ✅ ngrok süreçleri durduruldu');
    } catch (e) {
      // Süreç yok, sorun değil
    }
    // Biraz bekle
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e) {
    // Hata önemli değil
  }

  // Mevcut ngrok tünellerini kontrol et ve durdur
  try {
    const http = require('http');
    const tunnels = await new Promise((resolve) => {
      const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.tunnels || []);
          } catch (e) {
            resolve([]);
          }
        });
      });
      req.on('error', () => resolve([]));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve([]);
      });
    });

    if (tunnels.length > 0) {
      console.log(`⚠️  ${tunnels.length} mevcut ngrok tüneli bulundu, siliniyor...`);
      for (const tunnel of tunnels) {
        try {
          // ngrok API'sinden tüneli sil
          const tunnelName = tunnel.name || tunnel.public_url?.split('//')[1]?.split('.')[0];
          if (tunnelName) {
            const deleteReq = http.request({
              hostname: '127.0.0.1',
              port: 4040,
              path: `/api/tunnels/${tunnelName}`,
              method: 'DELETE'
            }, (res) => {
              // Silindi
            });
            deleteReq.on('error', () => {});
            deleteReq.end();
            console.log(`   ✅ Tünel silindi: ${tunnel.public_url || tunnelName}`);
          }
        } catch (e) {
          // Hata önemli değil
        }
      }
      // Tüm tünelleri kapat
      try {
        await ngrok.kill();
      } catch (e) {
        // Zaten kapalı
      }
      console.log('✅ Tüm tüneller temizlendi');
      // Biraz daha bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('');
    }
  } catch (e) {
    // ngrok çalışmıyor, devam et
    console.log('   ℹ️  Mevcut tünel yok, devam ediliyor...\n');
  }

  if (!AUTH_TOKEN) {
    console.error('❌ NGROK_AUTH_TOKEN bulunamadı!');
    console.log('');
    console.log('ngrok auth token\'ınızı almak için:');
    console.log('1. https://dashboard.ngrok.com/get-started/your-authtoken adresine gidin');
    console.log('2. Auth token\'ınızı kopyalayın');
    console.log('3. server/.env dosyasına şunu ekleyin:');
    console.log('   NGROK_AUTH_TOKEN=your_auth_token_here');
    console.log('');
    console.log('Opsiyonel ayarlar:');
    console.log('   NGROK_SUBDOMAIN=your-subdomain (Pro plan gerekli)');
    console.log('   NGROK_REGION=us|eu|ap|au|sa|jp|in (varsayılan: us)');
    process.exit(1);
  }

  // Port kontrolü - ngrok için backend'in çalışması gerekmez, sadece port numarası önemli
  console.log('🔍 Port kontrolü: Port', PORT, '(type:', typeof PORT, ')');

  console.log('');
  console.log('🚀 ngrok başlatılıyor...');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Region: ${REGION}`);
  if (SUBDOMAIN) {
    console.log(`🔗 Subdomain: ${SUBDOMAIN}`);
  }
  console.log('');

  try {
    // Önce tüm bağlantıları kapat
    try {
      await ngrok.kill();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      // Zaten kapalı
    }

    // ngrok config - port number olmalı
    // NOT: "name" parametresi sadece Pro plan'ta çalışır, ücretsiz planda kullanmayın
    const config = {
      addr: PORT,
      authtoken: AUTH_TOKEN,
      region: REGION,
    };

    // Cloud endpoint URL varsa kullan (ngrok v3+)
    if (CLOUD_ENDPOINT_URL) {
      config.url = CLOUD_ENDPOINT_URL;
      console.log(`🌐 Cloud Endpoint URL kullanılıyor: ${CLOUD_ENDPOINT_URL}`);
    }

    // Subdomain sadece Pro plan'ta çalışır
    if (SUBDOMAIN) {
      config.subdomain = SUBDOMAIN;
      // Subdomain kullanılıyorsa cloud endpoint URL'yi kaldır
      if (config.url) {
        delete config.url;
      }
    }

    console.log('🔧 ngrok config:', JSON.stringify({ ...config, authtoken: '***' }, null, 2));
    console.log('');

    // ngrok'u başlat - eğer "tunnel already exists" hatası alırsak, ngrok'un cloud tarafında eski tünel var demektir
    let url;
    try {
      url = await ngrok.connect(config);
    } catch (connectError) {
      // Eğer "tunnel already exists" hatası alırsak
      if (connectError.body && connectError.body.details && connectError.body.details.err && connectError.body.details.err.includes('already exists')) {
        console.error('');
        console.error('❌ ngrok Cloud tarafında eski tünel kaydı var!');
        console.error('');
        console.error('💡 Çözüm:');
        console.error('   1. ngrok Dashboard\'a gidin: https://dashboard.ngrok.com/tunnels');
        console.error('   2. Aktif tünelleri kapatın');
        console.error('   3. Ya da birkaç dakika bekleyin (ngrok otomatik olarak temizler)');
        console.error('   4. Sonra tekrar deneyin: npm run ngrok');
        console.error('');
        console.error('📋 Alternatif: Farklı bir port kullanın (örn: 5002)');
        console.error('');
        process.exit(1);
      }
      // Diğer hatalar için tekrar fırlat
      throw connectError;
    }

    // URL'leri daha görünür yap
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ngrok tüneli başlatıldı!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('🌐 Public URL:');
    console.log(`   ${url}`);
    console.log('');
    console.log('📡 API Endpoints:');
    console.log(`   ${url}/api`);
    console.log(`   ${url}/api-docs (Swagger)`);
    console.log(`   ${url}/api/health (Health Check)`);
    console.log('');
    console.log('📋 ngrok Dashboard:');
    console.log('   http://127.0.0.1:4040');
    console.log('');
    console.log('💡 Frontend için .env.local dosyasına ekleyin:');
    console.log(`   NEXT_PUBLIC_API_URL=${url}/api`);
    console.log('');
    console.log('🛑 Durdurmak için: Ctrl+C');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // ngrok API'den URL'i tekrar al (doğrulama için)
    try {
      const api = ngrok.getApi();
      if (api) {
        const tunnels = await api.listTunnels();
        if (tunnels && tunnels.length > 0) {
          console.log('📊 Aktif Tüneller:');
          tunnels.forEach((tunnel, index) => {
            console.log(`   ${index + 1}. ${tunnel.public_url} -> ${tunnel.config.addr}`);
          });
          console.log('');
        }
      }
    } catch (apiError) {
      // API hatası önemli değil, sadece log
    }

    // ngrok web interface'i otomatik açılır (http://127.0.0.1:4040)
    // Process sonlandığında ngrok'u kapat
    process.on('SIGINT', async () => {
      console.log('\n🛑 ngrok durduruluyor...');
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ ngrok başlatma hatası:', error.message);
    console.error('📋 Hata detayları:', error);
    console.log('');
    
    if (error.message.includes('authtoken') || error.message.includes('authentication')) {
      console.error('🔑 ngrok auth token sorunu:');
      console.error('   - Auth token geçersiz olabilir');
      console.error('   - server/.env dosyasındaki NGROK_AUTH_TOKEN değerini kontrol edin');
      console.error('   - Yeni token almak için: https://dashboard.ngrok.com/get-started/your-authtoken');
    } else if (error.message.includes('subdomain')) {
      console.error('🔗 Subdomain sorunu:');
      console.error('   - Subdomain kullanımı için ngrok Pro plan gerekli');
      console.error('   - server/.env dosyasından NGROK_SUBDOMAIN satırını kaldırın');
    } else if (error.message.includes('invalid tunnel configuration')) {
      console.error('⚙️  Tunnel configuration sorunu:');
      console.error('   - Port numarası:', PORT, '(type:', typeof PORT, ')');
      console.error('   - Region:', REGION);
      console.error('   - Auth token mevcut:', !!AUTH_TOKEN);
      console.error('');
      console.error('💡 Çözüm önerileri:');
      console.error('   1. Port numarasının doğru olduğundan emin olun (5001)');
      console.error('   2. Backend server\'ın çalıştığından emin olun');
      console.error('   3. ngrok config dosyasını kontrol edin: ~/.ngrok2/ngrok.yml');
      console.error('   4. ngrok\'u yeniden yapılandırın: npx ngrok config add-authtoken YOUR_TOKEN');
    } else {
      console.error('📚 Daha fazla bilgi için:');
      console.error('   - ngrok Dashboard: https://dashboard.ngrok.com');
      console.error('   - ngrok Docs: https://ngrok.com/docs');
    }
    console.log('');
    process.exit(1);
  }
}

startNgrok();

