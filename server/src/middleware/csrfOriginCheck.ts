import type { NextFunction, Request, Response } from 'express';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const csrfOriginCheck = (allowedOrigins: string[]) => {
  const normalized = allowedOrigins.filter(Boolean);

  return (req: Request, res: Response, next: NextFunction) => {
    const method = (req.method || 'GET').toUpperCase();
    if (!STATE_CHANGING_METHODS.has(method)) return next();

    const origin = req.headers.origin;
    // Non-browser callers / curl: Origin olmayabilir, engellemeyelim
    if (!origin) return next();

    // Aynı origin veya allowlist'te ise OK
    const isAllowed = normalized.includes(origin) || origin.includes('.ngrok-free.app') || origin.includes('.ngrok.io');
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'CSRF protection: Origin not allowed',
      });
    }

    return next();
  };
};

