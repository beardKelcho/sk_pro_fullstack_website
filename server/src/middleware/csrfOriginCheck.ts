import type { NextFunction, Request, Response } from 'express';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Development modunda local network IP'lerine izin ver
const isLocalNetworkOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  // localhost ve local network IP'leri (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);
};

export const csrfOriginCheck = (allowedOrigins: string[]) => {
  const normalized = allowedOrigins.filter(Boolean);

  return (req: Request, res: Response, next: NextFunction) => {
    const method = (req.method || 'GET').toUpperCase();
    if (!STATE_CHANGING_METHODS.has(method)) return next();

    const origin = req.headers.origin;
    // Non-browser callers / curl: Origin olmayabilir, engellemeyelim
    if (!origin) return next();

    // Aynı origin veya allowlist'te ise OK
    const isAllowed = normalized.includes(origin) || 
                      origin.includes('.ngrok-free.app') || 
                      origin.includes('.ngrok.io') ||
                      (process.env.NODE_ENV !== 'production' && isLocalNetworkOrigin(origin));
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'CSRF protection: Origin not allowed',
      });
    }

    return next();
  };
};

