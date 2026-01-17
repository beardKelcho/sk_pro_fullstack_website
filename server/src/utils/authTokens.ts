import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { IUser } from '../models/User';

export type AccessTokenPayload = {
  id: string;
  email: string;
  role: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

// JWT_SECRET'ları merkezi bir yerden al - tutarlılık için
// TÜM yerlerde aynı secret kullanılması için export ediyoruz
export const JWT_SECRET = process.env.JWT_SECRET || 'sk-production-secret';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sk-production-refresh-secret';

// Development modunda JWT_SECRET'ı logla (güvenlik için production'da loglanmaz)
if (process.env.NODE_ENV === 'development') {
  console.log('JWT_SECRET configured:', JWT_SECRET ? 'Yes (length: ' + JWT_SECRET.length + ')' : 'No (using default)');
  console.log('JWT_SECRET value (first 10 chars):', JWT_SECRET.substring(0, 10) + '...');
}

export const createTokenHash = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateTokenPair = (user: IUser): TokenPair => {
  const payload: AccessTokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id.toString() }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

export const isMobileClient = (req: { headers?: Record<string, any> }): boolean => {
  const raw =
    (req.headers?.['x-client'] as string | undefined) ||
    (req.headers?.['x-client-platform'] as string | undefined) ||
    '';
  const value = raw.toLowerCase().trim();
  return value === 'mobile' || value === 'expo' || value === 'react-native';
};

