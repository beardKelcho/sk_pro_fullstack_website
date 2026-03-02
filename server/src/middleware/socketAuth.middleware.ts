/**
 * Socket.io Authentication Middleware
 * WebSocket bağlantıları için JWT doğrulama
 */

import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/authTokens';
import { User } from '../models';
import logger from '../utils/logger';

/**
 * Socket.io authentication middleware
 */
export const authenticateSocket = async (socket: Socket, next: (err?: Error | unknown) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token bulunamadı'));
    }

    // JWT doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;

    // Kullanıcıyı bul
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findById((decoded as any).id || (decoded as any)._id).select('-password');
    if (!user || !user.isActive) {
      return next(new Error('Geçersiz kullanıcı veya hesap devre dışı'));
    }

    // Socket'e user bilgisini ekle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (socket as any).user = user;
    next();
  } catch (error: unknown) {
    logger.error('Socket authentication hatası:', error);
    next(new Error('Authentication başarısız'));
  }
};
