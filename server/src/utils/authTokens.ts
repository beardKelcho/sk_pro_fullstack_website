import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { IUser } from '../models/User';
import logger from './logger';

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
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is required in production');
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || 'sk-dev-only-secret-not-for-production';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sk-dev-only-refresh-secret-not-for-production';
// 2FA challenge — ayrı secret, 5 dk ömürlü, tek kullanımlık
const JWT_2FA_SECRET = (process.env.JWT_SECRET || 'sk-dev-only-secret-not-for-production') + ':2fa-challenge';

// Development modunda JWT_SECRET durumunu logla (değeri loglanmaz)
if (process.env.NODE_ENV === 'development') {
  logger.info('JWT secrets configured', {
    accessSecretSource: process.env.JWT_SECRET ? 'env' : 'fallback',
    refreshSecretSource: process.env.JWT_REFRESH_SECRET ? 'env' : 'fallback',
  });
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

export type TwoFAChallengePayload = {
  userId: string;
  jti: string;
  type: '2fa_challenge';
};

/**
 * Login sonrası 2FA gerekiyorsa kısa ömürlü, imzalı challenge token üretir.
 * jti replay koruması için User.pendingTwoFAChallenge'a kaydedilir.
 */
export const generate2FAChallenge = (userId: string): { token: string; jti: string } => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { userId, jti, type: '2fa_challenge' } as TwoFAChallengePayload,
    JWT_2FA_SECRET,
    { expiresIn: '5m' }
  );
  return { token, jti };
};

/**
 * Challenge token'ı doğrular ve payload döner.
 * İmza/süre hatası durumunda null döner.
 */
export const decode2FAChallenge = (token: string): TwoFAChallengePayload | null => {
  try {
    const payload = jwt.verify(token, JWT_2FA_SECRET) as TwoFAChallengePayload;
    if (payload.type !== '2fa_challenge') return null;
    return payload;
  } catch {
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMobileClient = (req: { headers?: Record<string, any> }): boolean => {
  const raw =
    (req.headers?.['x-client'] as string | undefined) ||
    (req.headers?.['x-client-platform'] as string | undefined) ||
    '';
  const value = raw.toLowerCase().trim();
  return value === 'mobile' || value === 'expo' || value === 'react-native';
};
