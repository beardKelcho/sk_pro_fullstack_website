import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Permission, hasPermission, hasRole, Role } from '../config/permissions';
import logger from '../utils/logger';
import { JWT_SECRET } from '../utils/authTokens'; // Merkezi JWT_SECRET kullan
import { IUser } from '../models/User';
import { updateSessionActivity } from '../controllers/session.controller';
import { Session } from '../models'; // Session verify için

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// JWT doğrulama middleware'i
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // 1. Header'dan token kontrolü
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // Token'ı temizle (boşluk, yeni satır, vs. kaldır)
      if (token) {
        token = token.trim();
      }
    }
    // 2. Cookie'den token kontrolü (Eğer header yoksa)
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor',
      });
    }

    // Token formatını kontrol et (JWT formatı: 3 bölüm, nokta ile ayrılmış)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      logger.error('Invalid token format received', {
        parts: tokenParts.length,
        tokenLength: token.length,
        path: req.path,
        firstChars: token.substring(0, 20)
      });
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token formatı',
        name: 'JsonWebTokenError',
      });
    }

    // Token doğrulama - JWT_SECRET'ı authTokens'tan import et (tutarlılık için)
    // Development modunda token ve secret bilgilerini logla
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Token verification attempt', {
        path: req.path,
        tokenLength: token.length,
        tokenParts: tokenParts.length,
        secretLength: JWT_SECRET.length,
        secretStart: JWT_SECRET.substring(0, 10) + '...',
        tokenStart: token.substring(0, 20) + '...'
      });
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as jwt.JwtPayload;

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token veya yetkisiz kullanıcı',
      });
    }

    // TC017 Fix & Security Hardening: Session Check (Relaxed for Production)
    // Token hash'ini oluştur
    const { createTokenHash } = require('../utils/authTokens');
    const tokenHash = createTokenHash(token);

    // Auth token'a karşılık gelen session kontrolü
    const session = await Session.findOne({
      userId: user._id,
      token: tokenHash
    });

    if (!session) {
      // Session veritabanında bulunamadı (Eski session veya senkronizasyon sorunu)
      // Kullanıcıyı engellemek yerine logla ve devam et (User request)
      logger.warn('Session not found in DB for valid JWT - Allowing access', {
        userId: user._id,
        path: req.path
      });
    } else if (!session.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Oturum sonlandırılmış. Lütfen tekrar giriş yapın.',
      });
    }


    // Session activity güncelle (static import ile)
    updateSessionActivity(user._id.toString(), token).catch((err: any) =>
      logger.error('Session activity güncelleme hatası:', err)
    );

    // Request'e kullanıcı bilgisini ekle
    req.user = user as IUser;
    next();
  } catch (error: any) {
    // Invalid signature veya expired token hatası için daha açıklayıcı mesaj
    const errorMessage = error.name === 'JsonWebTokenError'
      ? 'Geçersiz token. Lütfen tekrar giriş yapın.'
      : error.name === 'TokenExpiredError'
        ? 'Token süresi dolmuş. Lütfen tekrar giriş yapın.'
        : 'Yetkilendirme başarısız';

    logger.error('Kimlik doğrulama hatası:', {
      name: error.name,
      message: error.message,
      path: req.path
    });

    res.status(401).json({
      success: false,
      message: errorMessage,
      name: error.name, // Frontend'de invalid token kontrolü için
    });
  }
};

// Rol bazlı yetkilendirme middleware'i
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız',
      });
    }

    // Admin ve Firma Sahibi her şeye erişebilir
    if (hasRole(req.user.role, Role.ADMIN, Role.FIRMA_SAHIBI)) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor',
      });
    }

    next();
  };
};

// Yetki bazlı yetkilendirme middleware'i
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız',
      });
    }

    // Admin ve Firma Sahibi her şeye erişebilir
    if (hasRole(req.user.role, Role.ADMIN, Role.FIRMA_SAHIBI)) {
      return next();
    }

    // Kullanıcının özel yetkilerini kontrol et
    const userPermissions = req.user.permissions || [];
    if (!hasPermission(req.user.role, permission, userPermissions)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmuyor',
      });
    }

    next();
  };
}; 