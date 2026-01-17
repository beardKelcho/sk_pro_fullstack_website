import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import type { Request } from 'express';

const parseNumber = (raw: any, fallback: number) => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const getTokenFromReq = (req: Request): string | null => {
  const h = req.headers.authorization;
  if (typeof h === 'string' && h.startsWith('Bearer ')) return h.slice('Bearer '.length);
  return null;
};

const keyByUserOrIp = (req: Request): string => {
  try {
    const token = getTokenFromReq(req);
    if (token) {
      // Merkezi JWT_SECRET kullan
      const { JWT_SECRET } = require('../utils/authTokens');
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded?.id || decoded?._id || decoded?.userId;
      if (userId) return `user:${String(userId)}`;
    }
  } catch {
    // ignore
  }
  // fallback ip
  return `ip:${req.ip}`;
};

export const createRateLimiter = (opts: {
  windowMs: number;
  max: number;
  keyStrategy?: 'ip' | 'user_or_ip';
}) => {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS',
    keyGenerator: (req) => {
      if (opts.keyStrategy === 'user_or_ip') return keyByUserOrIp(req);
      return `ip:${req.ip}`;
    },
    message: { success: false, message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.', code: 'RATE_LIMITED' },
  });
};

// Defaults (env ile override edilebilir)
const WINDOW_15M = 15 * 60 * 1000;

export const generalApiLimiter = createRateLimiter({
  windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_15M),
  max: parseNumber(process.env.RATE_LIMIT_GENERAL_MAX, 500),
  keyStrategy: 'user_or_ip',
});

export const authLimiter = createRateLimiter({
  windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_15M),
  max: parseNumber(process.env.RATE_LIMIT_AUTH_MAX, 30),
  keyStrategy: 'ip',
});

export const uploadLimiter = createRateLimiter({
  windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_15M),
  max: parseNumber(process.env.RATE_LIMIT_UPLOAD_MAX, 60),
  keyStrategy: 'user_or_ip',
});

export const exportLimiter = createRateLimiter({
  windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_15M),
  max: parseNumber(process.env.RATE_LIMIT_EXPORT_MAX, 60),
  keyStrategy: 'user_or_ip',
});

export const rateLimitConfig = () => ({
  windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_15M),
  generalMax: parseNumber(process.env.RATE_LIMIT_GENERAL_MAX, 500),
  authMax: parseNumber(process.env.RATE_LIMIT_AUTH_MAX, 30),
  uploadMax: parseNumber(process.env.RATE_LIMIT_UPLOAD_MAX, 60),
  exportMax: parseNumber(process.env.RATE_LIMIT_EXPORT_MAX, 60),
});

