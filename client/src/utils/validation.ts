import { z } from 'zod';

// Kullanıcı şemaları
export const userSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(50, 'İsim en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  role: z.enum(['admin', 'user', 'editor']),
});

// Proje şemaları
export const projectSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['active', 'completed', 'cancelled']),
  budget: z.number().min(0, 'Bütçe 0\'dan küçük olamaz').optional(),
  tags: z.array(z.string()).optional(),
});

// İletişim formu şeması
export const contactFormSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır.').max(1000),
});

// Ekipman şeması
export const equipmentSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100, 'İsim en fazla 100 karakter olabilir'),
  type: z.enum(['video', 'audio', 'lighting', 'other']),
  serialNumber: z.string().optional(),
  purchaseDate: z.date().optional(),
  lastMaintenanceDate: z.date().optional(),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']),
  notes: z.string().optional(),
});

// API yanıt şeması
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }).optional(),
});

// Validasyon yardımcı fonksiyonları
export const validateInput = async <T>(schema: z.ZodSchema<T>, data: unknown): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') 
      };
    }
    return { success: false, error: 'Beklenmeyen bir hata oluştu' };
  }
};

// API route'ları için validasyon middleware'i
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const result = await validateInput(schema, body);
      
      if (!result.success) {
        return new Response(JSON.stringify({
          success: false,
          error: { message: result.error }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return result.data;
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: { message: 'Geçersiz istek formatı' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
};

// Performans metrik şeması
export const performanceMetricSchema = z.object({
  name: z.string().min(1, 'Metrik adı gereklidir.').max(100),
  value: z.number(),
  metadata: z.record(z.any()).optional(),
});

// XSS koruması için HTML temizleme
export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// SQL injection koruması için string temizleme
export const sanitizeSQL = (str: string): string => {
  if (!str) return '';
  
  // Tehlikeli karakterleri temizle
  return str
    .replace(/'/g, "''") // SQL içinde tek tırnak kaçışı
    .replace(/\\/g, '\\\\') // Backslash kaçışı
    .replace(/\0/g, '\\0') // NULL byte
    .replace(/%/g, '\\%') // LIKE operatörü için % kaçışı
    .replace(/_/g, '\\_'); // LIKE operatörü için _ kaçışı
};

// Dosya yükleme validasyonu
export const validateFile = (file: File, options: {
  maxSize?: number; // MB cinsinden
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
} = {}) => {
  const errors: string[] = [];

  // Dosya boyutu kontrolü
  if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
    errors.push(`Dosya boyutu ${options.maxSize}MB'dan küçük olmalıdır`);
  }

  // Dosya tipi kontrolü
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`Dosya tipi ${options.allowedTypes.join(', ')} olmalıdır`);
  }

  // Resim boyutları kontrolü
  if (file.type.startsWith('image/') && (options.maxWidth || options.maxHeight)) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (options.maxWidth && img.width > options.maxWidth) {
          errors.push(`Resim genişliği ${options.maxWidth}px'den küçük olmalıdır`);
        }
        if (options.maxHeight && img.height > options.maxHeight) {
          errors.push(`Resim yüksekliği ${options.maxHeight}px'den küçük olmalıdır`);
        }
        resolve({ success: errors.length === 0, errors });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  return { success: errors.length === 0, errors };
};

// API anahtar şeması
export const apiKeySchema = z.object({
  key: z.string().min(32).max(64),
  name: z.string().min(3).max(50),
  permissions: z.array(z.string()),
  expiresAt: z.date().optional(),
});

// Email formatı doğrulama
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Parola güvenliği kontrol
export function isStrongPassword(password: string): boolean {
  // En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Telefon numarası formatı kontrol
export function isValidPhoneNumber(phone: string): boolean {
  // Türkiye telefon numarası formatı: +90 5XX XXX XX XX veya 05XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
} 