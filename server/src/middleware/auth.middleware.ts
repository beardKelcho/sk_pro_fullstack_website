import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Permission, hasPermission, hasRole, Role } from '../config/permissions';
import logger from '../utils/logger';
import { JWT_SECRET } from '../utils/authTokens'; // Merkezi JWT_SECRET kullan
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
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(); // Token yoksa bile (public isteklerde) patlatma, next de.

    // Sadece verify et, DB'ye gidip session arama.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as any;
    next();
  } catch (error) {
    // Token geçersizse bile devam et (Public erişim için), yetki kontrolünü route seviyesinde yaparız.
    next();
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