#!/usr/bin/env node

/**
 * ngrok URL'ini göster
 * ngrok çalışıyorsa, aktif URL'leri gösterir
 */

const http = require('http');

async function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.tunnels && response.tunnels.length > 0) {
            resolve(response.tunnels);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('ngrok çalışmıyor. Önce ngrok\'u başlatın: npm run ngrok'));
      } else {
        reject(error);
      }
    });

    req.setTimeout(2000, () => {
      req.destroy();
      reject(new Error('ngrok API\'ye bağlanılamadı'));
    });
  });
}

async function main() {
  try {
    const tunnels = await getNgrokUrl();
    
    if (tunnels.length === 0) {
      console.log('❌ Aktif ngrok tüneli bulunamadı');
      console.log('');
      console.log('ngrok\'u başlatmak için:');
      console.log('  npm run ngrok');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 Aktif ngrok Tünelleri:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    tunnels.forEach((tunnel, index) => {
      console.log(`${index + 1}. ${tunnel.name || 'Tunnel'}`);
      console.log(`   Public URL: ${tunnel.public_url}`);
      console.log(`   Local: ${tunnel.config.addr}`);
      console.log(`   Protocol: ${tunnel.proto}`);
      console.log('');
    });

    const httpsTunnel = tunnels.find(t => t.proto === 'https');
    if (httpsTunnel) {
      console.log('📡 API Endpoints:');
      console.log(`   ${httpsTunnel.public_url}/api`);
      console.log(`   ${httpsTunnel.public_url}/api-docs`);
      console.log('');
      console.log('💡 Frontend için .env.local dosyasına ekleyin:');
      console.log(`   NEXT_PUBLIC_API_URL=${httpsTunnel.public_url}/api`);
      console.log('');
    }

    console.log('📋 ngrok Dashboard: http://127.0.0.1:4040');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('');
    console.log('ngrok\'u başlatmak için:');
    console.log('  npm run ngrok');
    process.exit(1);
  }
}

main();

