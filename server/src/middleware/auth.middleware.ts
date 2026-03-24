import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Session } from '../models';
import { Permission, hasPermission, hasRole, Role } from '../config/permissions';
import logger from '../utils/logger';
import { JWT_SECRET, createTokenHash } from '../utils/authTokens';
import { IUser } from '../models/User';
import { updateSessionActivity } from '../controllers/session.controller';

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
    // Token'ı header'dan veya cookie'den al
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Token yoksa yetkisiz
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor',
      });
    }

    // JWT verify et
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Kullanıcıyı database'den çek
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token veya yetkisiz kullanıcı',
      });
    }

    // Session geçerliliğini veritabanından doğrula (logout sonrası token invalidation)
    try {
      const tokenHash = createTokenHash(token);
      const session = await Session.findOne({
        userId: user._id,
        token: tokenHash,
        isActive: true,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Oturum geçersiz veya sonlandırılmış. Lütfen tekrar giriş yapın.',
        });
      }
    } catch (sessionError) {
      // DB hatası: güvenli tarafta kal, loglayıp devam et
      logger.error('Session doğrulama DB hatası:', sessionError);
    }

    // Session activity güncelle (background, hata patlatmaz)
    updateSessionActivity(user._id.toString(), token).catch((err: unknown) =>
      logger.error('Session activity güncelleme hatası:', err)
    );

    // Request'e kullanıcı bilgisini ekle
    req.user = user as IUser;
    next();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error && error.name === 'JsonWebTokenError'
        ? 'Geçersiz token. Lütfen tekrar giriş yapın.'
        : error instanceof Error && error.name === 'TokenExpiredError'
          ? 'Token süresi dolmuş. Lütfen tekrar giriş yapın.'
          : 'Yetkilendirme başarısız';

    logger.error('Kimlik doğrulama hatası:', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });

    res.status(401).json({
      success: false,
      message: errorMessage,
      name: error instanceof Error ? error.name : 'Error',
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