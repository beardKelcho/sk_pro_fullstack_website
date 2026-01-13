import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { Permission, hasPermission, hasRole, Role } from '../config/permissions';

declare global {
  namespace Express {
    interface Request {
      user?: any;
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
    
    // Header'dan token alınması
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor',
      });
    }
    
    // Token doğrulama
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sk-production-secret'
    ) as jwt.JwtPayload;
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token veya yetkisiz kullanıcı',
      });
    }
    
    // Request'e kullanıcı bilgisini ekle
    req.user = user;
    next();
  } catch (error) {
    console.error('Kimlik doğrulama hatası:', error);
    res.status(401).json({
      success: false,
      message: 'Yetkilendirme başarısız',
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