import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * QR kod içeriği oluşturur
 * Format: SKPRO-{TYPE}-{UUID}-{RELATED_ID}
 * @param type - QR kod tipi (EQUIPMENT, PROJECT, CUSTOM)
 * @param relatedId - İlişkili kayıt ID'si
 * @returns QR kod içeriği
 * @example
 * generateQRCodeContent('EQUIPMENT', '507f1f77bcf86cd799439011')
 * // "SKPRO-EQU-A1B2C3D4-507F1F77"
 */
export function generateQRCodeContent(type: 'EQUIPMENT' | 'PROJECT' | 'CUSTOM', relatedId: string): string {
  const prefix = 'SKPRO';
  const typeCode = type.substring(0, 3); // EQU, PRO, CUS
  const uniqueId = uuidv4().substring(0, 8).toUpperCase();
  return `${prefix}-${typeCode}-${uniqueId}-${relatedId.substring(0, 8).toUpperCase()}`;
}

/**
 * QR kod görseli oluşturur (base64 PNG)
 * @param content - QR kod içeriği
 * @param options - QR kod seçenekleri
 * @param options.width - QR kod genişliği (px, default: 300)
 * @param options.margin - QR kod margin (default: 2)
 * @param options.color - QR kod renkleri (dark, light)
 * @returns Base64 encoded PNG data URL
 * @throws QR kod oluşturma hatası
 * @example
 * const qrImage = await generateQRCodeImage('SKPRO-EQU-123', { width: 400 });
 */
export async function generateQRCodeImage(
  content: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  try {
    const dataUrl = await QRCode.toDataURL(content, {
      width: defaultOptions.width,
      margin: defaultOptions.margin,
      color: defaultOptions.color,
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    throw new Error(`QR kod oluşturma hatası: ${error}`);
  }
}

/**
 * QR kod içeriğini parse eder
 * @param qrContent - QR kod içeriği
 * @returns Parse edilmiş QR kod bilgileri
 * @example
 * parseQRCodeContent('SKPRO-EQU-A1B2C3D4-507F1F77')
 * // { prefix: 'SKPRO', type: 'EQU', uniqueId: 'A1B2C3D4', relatedId: '507F1F77', isValid: true }
 */
export function parseQRCodeContent(qrContent: string): {
  prefix: string;
  type: string;
  uniqueId: string;
  relatedId: string;
  isValid: boolean;
} {
  const parts = qrContent.split('-');
  
  if (parts.length !== 4 || parts[0] !== 'SKPRO') {
    return {
      prefix: '',
      type: '',
      uniqueId: '',
      relatedId: '',
      isValid: false,
    };
  }

  return {
    prefix: parts[0],
    type: parts[1],
    uniqueId: parts[2],
    relatedId: parts[3],
    isValid: true,
  };
}

