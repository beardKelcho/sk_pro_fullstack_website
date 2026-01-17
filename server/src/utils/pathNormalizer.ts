/**
 * Path Normalization Utility
 * Tüm dosya path'lerini standart formata çevirir
 */

import path from 'path';
import { convertToCDNUrl } from '../config/cdn';

/**
 * Path'i normalize et
 * Farklı formatları standart formata çevirir
 * 
 * @param filePath - Normalize edilecek path
 * @param category - Dosya kategorisi (opsiyonel)
 * @returns Normalize edilmiş path
 * 
 * Örnekler:
 * - "/uploads/site-images/file.jpg" -> "site-images/file.jpg"
 * - "uploads/site-images/file.jpg" -> "site-images/file.jpg"
 * - "site-images/file.jpg" -> "site-images/file.jpg"
 * - "file.jpg" -> "general/file.jpg" (category yoksa)
 */
export const normalizePath = (filePath: string, category?: string): string => {
  if (!filePath) {
    return category ? `${category}/` : 'general/';
  }

  // Başındaki ve sonundaki slash'leri temizle
  let normalized = filePath.trim().replace(/^\/+|\/+$/g, '');

  // "uploads/" ile başlıyorsa kaldır
  if (normalized.startsWith('uploads/')) {
    normalized = normalized.substring(8);
  }

  // "/uploads/" ile başlıyorsa kaldır
  if (normalized.startsWith('/uploads/')) {
    normalized = normalized.substring(9);
  }

  // Eğer sadece filename ise (klasör yoksa), category ekle
  if (!normalized.includes('/')) {
    normalized = category ? `${category}/${normalized}` : `general/${normalized}`;
  }

  return normalized;
};

/**
 * URL'i normalize et
 * Path'den URL oluşturur
 * 
 * @param filePath - Normalize edilmiş path
 * @returns URL
 */
export const pathToUrl = (filePath: string): string => {
  const normalized = normalizePath(filePath);
  const localUrl = `/uploads/${normalized}`;
  
  // CDN aktifse CDN URL'ine çevir
  return convertToCDNUrl(localUrl);
};

/**
 * URL'den path çıkar
 * 
 * @param url - URL
 * @returns Normalize edilmiş path
 */
export const urlToPath = (url: string): string => {
  if (!url) return '';

  // Tam URL ise (http:// veya https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const urlObj = new URL(url);
    url = urlObj.pathname;
  }

  // "/uploads/" ile başlıyorsa kaldır
  if (url.startsWith('/uploads/')) {
    return url.substring(9);
  }

  // "/uploads" ile başlıyorsa kaldır
  if (url.startsWith('/uploads')) {
    return url.substring(8);
  }

  return normalizePath(url);
};

/**
 * Dosya yolunu tam path'e çevir
 * 
 * @param filePath - Normalize edilmiş path
 * @returns Tam dosya yolu
 */
export const getFullPath = (filePath: string): string => {
  const normalized = normalizePath(filePath);
  return path.join(process.cwd(), 'uploads', normalized);
};

/**
 * Path'in geçerli olup olmadığını kontrol et
 * 
 * @param filePath - Kontrol edilecek path
 * @returns Geçerli mi?
 */
export const isValidPath = (filePath: string): boolean => {
  if (!filePath) return false;

  // Tehlikeli karakterler kontrolü
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(filePath)) {
    return false;
  }

  // Path traversal kontrolü
  if (filePath.includes('..')) {
    return false;
  }

  return true;
};

