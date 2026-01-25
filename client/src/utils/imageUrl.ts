/**
 * Image URL utility functions
 * Centralized image URL construction logic
 * 
 * @module utils/imageUrl
 * @description Görsel URL'lerini oluşturmak için merkezi utility fonksiyonları
 * API endpoint'lerinden, image objelerinden veya ID'lerden tam URL oluşturur
 * 
 * @example
 * ```typescript
 * import { getImageUrl } from '@/utils/imageUrl';
 * 
 * // ID ile
 * const url1 = getImageUrl({ imageId: '123' });
 * 
 * // Image objesi ile
 * const url2 = getImageUrl({ image: { _id: '123', url: '/uploads/img.jpg' } });
 * 
 * // Fallback ile
 * const url3 = getImageUrl({ fallback: '/default-image.jpg' });
 * ```
 */

export interface ImageUrlOptions {
  imageId?: string;
  image?: {
    _id?: string;
    id?: string;
    url?: string;
    path?: string;
    filename?: string;
  };
  fallback?: string;
}

/**
 * API URL'den base URL'i çıkarır
 * @returns Base URL (API URL'den /api kısmı çıkarılmış)
 * @example
 * getBaseUrl() // "http://localhost:5001" (NEXT_PUBLIC_API_URL = "http://localhost:5001/api")
 */
export const getBaseUrl = (): string => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  return API_URL.endsWith('/api')
    ? API_URL.replace(/\/api$/, '')
    : API_URL.replace(/\/api\/?$/, '');
};

/**
 * Image object veya ID'den image URL'i oluşturur
 * @param options - Image URL seçenekleri
 * @param options.imageId - Image ID (öncelikli)
 * @param options.image - Image object (imageId yoksa kullanılır)
 * @param options.fallback - Fallback URL (hiçbiri yoksa)
 * @returns Image URL
 * @example
 * getImageUrl({ imageId: "123" }) // "/api/site-images/public/123/image"
 * getImageUrl({ image: { url: "/uploads/image.jpg" } }) // "http://localhost:5001/uploads/image.jpg"
 */
export const getImageUrl = (options: ImageUrlOptions | string | null | undefined): string => {
  if (!options) return '';

  const normalized: ImageUrlOptions = typeof options === 'string' ? { imageId: options } : options;
  const { imageId, image, fallback } = normalized;

  // 1. ÖNCELİK: Eğer resim objesinde zaten absolute bir URL varsa, onu kullan.
  // Backend'de "Strict Mode" ile Cloudinary URL'leri zorlandı, frontend bunu ezmemeli.
  // Bu kontrolü EN BAŞA alıyoruz, çünkü Carousel gibi komponentler hem imageId hem image objesi gönderebilir.
  // Eğer image objesi varsa ve içinde valid URL varsa, imageId'ye bakmaksızın bunu kullanmalıyız.
  if (image && image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) {
    return image.url;
  }

  // If imageId is provided, use it directly
  if (imageId) {
    // Check if it's actually a URL
    if (imageId.startsWith('http://') || imageId.startsWith('https://') || imageId.startsWith('/uploads/')) {
      return imageId;
    }

    // Geçersiz ID kontrolü (sadece MongoDB ObjectId formatı veya geçerli string)
    // Ayrıca Next.js internal hash'leri (12-32 karakterlik hex) olmadığından emin ol
    if (typeof imageId === 'string' && imageId.trim() !== '' && imageId.length >= 12) {
      // Next.js internal hash pattern'i kontrolü - sadece hex karakterler ve belirli uzunluk
      // Eğer sadece hex karakterlerden oluşuyorsa ve 12-32 karakter arasındaysa, bu bir MongoDB ObjectId olabilir
      // Ama eğer bu bir Next.js internal hash ise, bunu handle etme
      const isOnlyHex = /^[0-9a-f]+$/i.test(imageId);
      if (isOnlyHex && imageId.length >= 12 && imageId.length <= 32) {
        // Bu bir MongoDB ObjectId veya benzer bir ID - Relative path kullan (Next.js rewrites proxy eder)
        return `/api/site-images/public/${imageId}/image`;
      }
    }
    // Geçersiz ID ise fallback döndür
    return fallback || '';
  }

  // If image object is provided (and didn't match absolute URL above)
  if (image) {
    // 2. Try to use ID for local proxying (fallback)
    const dbId = image._id || image.id;
    if (dbId && typeof dbId === 'string' && dbId.trim() !== '' && dbId.length >= 12) {
      // Next.js internal hash pattern'i kontrolü
      const isOnlyHex = /^[0-9a-f]+$/i.test(dbId);
      if (isOnlyHex && dbId.length >= 12 && dbId.length <= 32) {
        // Bu bir MongoDB ObjectId - Relative path kullan (Next.js rewrites proxy eder)
        return `/api/site-images/public/${dbId}/image`;
      }
    }

    // Fallback to URL, path, or filename
    let imageUrl = image.url || '';
    if (!imageUrl && image.path) {
      imageUrl = image.path;
    }
    if (!imageUrl && image.filename) {
      imageUrl = `/uploads/site-images/${image.filename}`;
    }

    if (!imageUrl || imageUrl.trim() === '') {
      // Eğer fallback varsa onu kullan, yoksa boş string döndür
      return fallback || '';
    }

    // Eğer zaten full URL ise (http/https ile başlıyorsa), olduğu gibi döndür
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Relative path ise olduğu gibi döndür (Next.js rewrites proxy eder)
    // /uploads/ ile başlıyorsa veya / ile başlıyorsa relative path olarak kullan
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Relative path değilse, / ekle
    return `/${imageUrl}`;
  }

  return fallback || '';
};

