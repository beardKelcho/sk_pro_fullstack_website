import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../types/common';
import logger from '../utils/logger';
import { updateSessionActivity } from '../utils/authTokens';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Quick Access Type Extension
export interface AuthRequest extends Request {
  user?: IUser;
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

    // Kullanıcıyı database'den çek (getProfile controller bunu bekliyor!)
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token veya yetkisiz kullanıcı',
      });
    }

    // Session check BYPASSED (acil kurtarma için kaldırıldı)
    logger.info('Auth Check Bypassed - Session DB Check Removed', { userId: user._id });

    // Session activity güncelle (background, hata patlatmaz)
    updateSessionActivity(user._id.toString(), token).catch((err: any) =>
      logger.error('Session activity güncelleme hatası:', err)
    );

    // Request'e kullanıcı bilgisini ekle
    req.user = user as IUser;
    next();
  } catch (error: any) {
    const errorMessage =
      error.name === 'JsonWebTokenError'
        ? 'Geçersiz token. Lütfen tekrar giriş yapın.'
        : error.name === 'TokenExpiredError'
          ? 'Token süresi dolmuş. Lütfen tekrar giriş yapın.'
          : 'Yetkilendirme başarısız';

    logger.error('Kimlik doğrulama hatası:', {
      name: error.name,
      message: error.message,
      path: req.path,
    });

    res.status(401).json({
      success: false,
      message: errorMessage,
      name: error.name,
    });
  }
};

// Yetkilendirme middleware'i (rollere göre)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok',
      });
    }
    next();
  };
};

// Specific permission kontrolü
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
    }

    // Admin her zaman geçer
    if (user.role === 'ADMIN') {
      return next();
    }

    // Permission kontrolü (eğer permissions field'ı varsa)
    if (user.permissions && user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `${permission} yetkisi gereklidir`,
    });
  };
};