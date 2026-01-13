#!/usr/bin/env node

/**
 * Tüm ngrok URL'lerini göster
 */

const http = require('http');

async function getAllNgrokUrls() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.tunnels || []);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('ngrok çalışmıyor'));
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
    const tunnels = await getAllNgrokUrls();
    
    if (tunnels.length === 0) {
      console.log('❌ Aktif ngrok tüneli bulunamadı');
      process.exit(1);
    }

    const frontendTunnel = tunnels.find(t => 
      t.proto === 'https' && String(t.config?.addr || '').includes('3000')
    );
    
    const backendTunnel = tunnels.find(t => 
      t.proto === 'https' && String(t.config?.addr || '').includes('5001')
    );

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 PAYLAŞILABİLİR LİNKLER');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    if (frontendTunnel) {
      console.log('✅ WEB SİTESİ (Ana Link - Bu Linki Paylaşın!):');
      console.log(`   ${frontendTunnel.public_url}`);
      console.log('');
      console.log('   💡 Bu link web sitenizi açacak!');
      console.log('');
    } else {
      console.log('⏳ Frontend ngrok başlatılıyor...');
      console.log('   ngrok Dashboard: http://127.0.0.1:4040');
      console.log('');
    }

    if (backendTunnel) {
      console.log('📡 Backend API:');
      console.log(`   ${backendTunnel.public_url}/api`);
      console.log('');
      console.log('📚 Swagger Dokümantasyon:');
      console.log(`   ${backendTunnel.public_url}/api-docs`);
      console.log('');
      console.log('🔐 Admin Panel:');
      console.log(`   ${backendTunnel.public_url}/admin`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 ngrok Dashboard: http://127.0.0.1:4040');
    console.log('   (Tüm tünelleri ve istekleri görebilirsiniz)');
    console.log('');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('');
    console.log('ngrok\'u başlatmak için:');
    console.log('  npm run ngrok        # Backend için');
    console.log('  npm run ngrok:frontend  # Frontend için');
    process.exit(1);
  }
}

main();

