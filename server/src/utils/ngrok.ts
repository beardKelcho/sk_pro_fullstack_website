import ngrok from 'ngrok';
import logger from './logger';

let ngrokUrl: string | null = null;

/**
 * ngrok tünelini başlat
 */
export const startNgrok = async (port: number): Promise<string> => {
  try {
    const authToken = process.env.NGROK_AUTH_TOKEN;
    
    if (!authToken) {
      logger.warn('NGROK_AUTH_TOKEN bulunamadı. ngrok başlatılamıyor.');
      logger.info('ngrok hesabınızdan auth token alıp NGROK_AUTH_TOKEN environment variable olarak ekleyin.');
      logger.info('ngrok dashboard: https://dashboard.ngrok.com/get-started/your-authtoken');
      return '';
    }

    // ngrok'u yapılandır
    const url = await ngrok.connect({
      addr: port,
      authtoken: authToken,
      region: 'us', // veya 'eu', 'ap', 'au', 'sa', 'jp', 'in'
      subdomain: process.env.NGROK_SUBDOMAIN, // Opsiyonel: özel subdomain (Pro plan gerekli)
    });

    ngrokUrl = url;
    logger.info(`✅ ngrok tüneli başlatıldı: ${url}`);
    logger.info(`🌐 Backend URL: ${url}`);
    logger.info(`📡 API URL: ${url}/api`);
    
    return url;
  } catch (error: any) {
    logger.error('ngrok başlatma hatası:', error);
    if (error.message?.includes('authtoken')) {
      logger.error('ngrok auth token geçersiz. Lütfen NGROK_AUTH_TOKEN değerini kontrol edin.');
    }
    return '';
  }
};

/**
 * ngrok tünelini durdur
 */
export const stopNgrok = async (): Promise<void> => {
  try {
    if (ngrokUrl) {
      await ngrok.disconnect();
      await ngrok.kill();
      ngrokUrl = null;
      logger.info('ngrok tüneli durduruldu');
    }
  } catch (error) {
    logger.error('ngrok durdurma hatası:', error);
  }
};

/**
 * Mevcut ngrok URL'ini al
 */
export const getNgrokUrl = (): string | null => {
  return ngrokUrl;
};

// Process sonlandığında ngrok'u kapat
process.on('SIGINT', async () => {
  await stopNgrok();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopNgrok();
  process.exit(0);
});

