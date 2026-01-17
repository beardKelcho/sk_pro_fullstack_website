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

const JWT_SECRET = process.env.JWT_SECRET || 'sk-production-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sk-production-refresh-secret';

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

