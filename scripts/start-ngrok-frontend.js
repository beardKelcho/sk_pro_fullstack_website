#!/usr/bin/env node

/**
 * Frontend için ngrok Başlatma Script'i
 * Frontend (Next.js) server'ı ngrok ile internet üzerinden erişilebilir hale getirir
 */

const ngrok = require('ngrok');
const path = require('path');
const fs = require('fs');

// .env dosyasını manuel olarak oku
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

const PORT = 3000; // Frontend port
const AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;
const REGION = process.env.NGROK_REGION || 'us';

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
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (e) {
    // Hata önemli değil
  }

  if (!AUTH_TOKEN) {
    console.error('❌ NGROK_AUTH_TOKEN bulunamadı!');
    process.exit(1);
  }

  console.log('');
  console.log('🚀 Frontend için ngrok başlatılıyor...');
  console.log(`📡 Port: ${PORT} (Frontend)`);
  console.log(`🌍 Region: ${REGION}`);
  console.log('');

  try {
    // Önce tüm bağlantıları kapat
    try {
      await ngrok.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
      // Zaten kapalı
    }

    const config = {
      addr: PORT,
      authtoken: AUTH_TOKEN,
      region: REGION,
    };

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
        console.error('   4. Sonra tekrar deneyin: npm run ngrok:frontend');
        console.error('');
        process.exit(1);
      }
      // Diğer hatalar için detaylı mesaj göster
      console.error('❌ ngrok başlatma hatası:', connectError.message);
      if (connectError.body) {
        console.error('📋 Hata detayları:', JSON.stringify(connectError.body, null, 2));
      }
      throw connectError;
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Frontend ngrok tüneli başlatıldı!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('🌐 Frontend Public URL:');
    console.log(`   ${url}`);
    console.log('');
    console.log('💡 Bu URL ile web sitenizi paylaşabilirsiniz!');
    console.log('');
    console.log('🛑 Durdurmak için: Ctrl+C');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

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
    if (error.body) {
      console.error('📋 Hata detayları:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

startNgrok();

