/**
 * CDN Configuration
 * CDN URL'lerini ve yapılandırmasını yönetir
 */

import logger from '../utils/logger';

export type CDNProvider = 'cloudinary' | 'cloudfront' | 'cloudflare' | 'none';

/**
 * CDN provider'ı environment variable'dan al
 */
export const getCDNProvider = (): CDNProvider => {
  if (process.env.CDN_PROVIDER) {
    return (process.env.CDN_PROVIDER.toLowerCase() as CDNProvider);
  }
  // Auto-detect Cloudinary
  if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
    return 'cloudinary';
  }
  return 'none';
};

/**
 * CDN base URL'ini al
 */
export const getCDNBaseURL = (): string => {
  const provider = getCDNProvider();

  switch (provider) {
    case 'cloudinary':
      // Cloudinary CDN URL'i otomatik olarak Cloudinary service'ten gelir
      return process.env.CLOUDINARY_CDN_URL || '';
    case 'cloudfront':
      return process.env.CLOUDFRONT_DISTRIBUTION_URL || '';
    case 'cloudflare':
      return process.env.CLOUDFLARE_CDN_URL || '';
    case 'none':
    default:
      return '';
  }
};

/**
 * URL'i CDN URL'ine çevir
 * @param originalUrl - Orijinal URL (local veya cloud storage)
 * @returns CDN URL'i (eğer CDN aktifse)
 */
export const convertToCDNUrl = (originalUrl: string): string => {
  const provider = getCDNProvider();
  const cdnBaseUrl = getCDNBaseURL();

  // CDN aktif değilse orijinal URL'i döndür
  if (provider === 'none' || !cdnBaseUrl) {
    return originalUrl;
  }

  // Cloudinary URL'leri zaten CDN üzerinden gelir, değiştirmeye gerek yok
  if (originalUrl.includes('cloudinary.com') || originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  // S3 URL'lerini CloudFront URL'ine çevir
  if (provider === 'cloudfront' && originalUrl.includes('.s3.') && cdnBaseUrl) {
    // S3 URL'den key'i çıkar
    const s3UrlMatch = originalUrl.match(/\.s3\.[^/]+\/(.+)$/);
    if (s3UrlMatch && s3UrlMatch[1]) {
      return `${cdnBaseUrl}/${s3UrlMatch[1]}`;
    }
  }

  // Local URL'leri CDN'e çevir (statik dosyalar için)
  if (originalUrl.startsWith('/uploads/') || originalUrl.startsWith('/static/')) {
    const path = originalUrl.replace(/^\//, '');
    return `${cdnBaseUrl}/${path}`;
  }

  // Diğer durumlarda orijinal URL'i döndür
  return originalUrl;
};

/**
 * CDN yapılandırmasını logla
 */
export const logCDNConfig = (): void => {
  const provider = getCDNProvider();
  const cdnBaseUrl = getCDNBaseURL();

  if (provider === 'none') {
    logger.info('📡 CDN: Disabled (using direct URLs)');
  } else {
    logger.info(`📡 CDN: ${provider.toUpperCase()} enabled`, { baseUrl: cdnBaseUrl || 'Not configured' });
  }
};
