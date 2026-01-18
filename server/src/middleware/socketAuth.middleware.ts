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
export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token bulunamadı'));
    }

    // JWT doğrula
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user || !user.isActive) {
      return next(new Error('Geçersiz kullanıcı veya hesap devre dışı'));
    }

    // Socket'e user bilgisini ekle
    (socket as any).user = user;
    next();
  } catch (error: any) {
    logger.error('Socket authentication hatası:', error);
    next(new Error('Authentication başarısız'));
  }
};
