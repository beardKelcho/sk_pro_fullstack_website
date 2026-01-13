import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// API istekleri için rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek sayısı
  message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth istekleri için daha sıkı rate limiter
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // IP başına maksimum giriş denemesi
  message: 'Çok fazla giriş denemesi yaptınız. Lütfen 1 saat sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin paneli için özel rate limiter
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 1000, // IP başına maksimum istek
  message: 'Admin paneli için istek limitine ulaştınız. Lütfen 1 saat sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// IP bazlı rate limiting middleware
export const ipBasedRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // IP adresini kontrol et
  if (!ip) {
    return res.status(400).json({ error: 'IP adresi bulunamadı' });
  }

  // Rate limiting kurallarını uygula
  if (req.path.startsWith('/api/auth')) {
    return authLimiter(req, res, next);
  } else if (req.path.startsWith('/api/admin')) {
    return adminLimiter(req, res, next);
  } else {
    return apiLimiter(req, res, next);
  }
}; 