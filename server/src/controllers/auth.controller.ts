import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Session, User } from '../models';
import { IUser } from '../models/User';
import logger from '../utils/logger';
import { logLoginAction } from '../utils/auditLogger';
import { createTokenHash, generateTokenPair, isMobileClient } from '../utils/authTokens';
import { AppError } from '../types/common';

const getClientIp = (req: Request): string | undefined => {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf.length) return xf[0];
  return req.ip;
};

// Kullanıcı giriş işlemi
export const login = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] || 'unknown';
  logger.info('Login attempt started', { requestId, email: req.body?.email ? 'provided' : 'missing' });
  
  try {
    const { email, password } = req.body;
    logger.debug('Login request body received', { requestId, hasEmail: !!email, hasPassword: !!password });
    const identifierRaw = typeof email === 'string' ? email.trim() : '';
    const isEmail = identifierRaw.includes('@');
    const identifierEmail = isEmail ? identifierRaw.toLowerCase() : '';
    const identifierPhone = !isEmail ? identifierRaw.replace(/[^\d+]/g, '') : '';

    // Gerekli alanları kontrol et
    if (!identifierRaw || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir',
      });
    }

    // Email veya telefon ile kullanıcıyı bul
    const user = await User.findOne({
      $or: [
        ...(identifierEmail ? [{ email: identifierEmail }] : []),
        ...(identifierPhone ? [{ phone: identifierPhone }, { phone: identifierRaw }] : []),
      ],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email ya da şifre',
      });
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış',
      });
    }

    // Şifreyi doğrula
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email ya da şifre',
      });
    }

    // 2FA kontrolü - Eğer 2FA aktifse, token yerine 2FA doğrulaması gerektiğini belirt
    if (user.is2FAEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: '2FA doğrulaması gerekiyor',
        email: user.email, // Frontend'de kullanmak için
      });
    }

    // Token üret
    let accessToken: string;
    let refreshToken: string;
    try {
      logger.debug('Generating token pair', { requestId, userId: user._id.toString() });
      const tokens = generateTokenPair(user as unknown as IUser);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
      logger.debug('Token pair generated successfully', { requestId, accessTokenLength: accessToken.length });
    } catch (tokenError: unknown) {
      const error = tokenError as AppError;
      logger.error('Token üretme hatası:', { requestId, error, message: error?.message, stack: error?.stack });
      throw new Error('Token üretilemedi: ' + (error?.message || 'Bilinmeyen hata'));
    }

    // Session oluştur (hash'li token/refreshToken)
    try {
      await Session.create({
        userId: user._id,
        token: createTokenHash(accessToken),
        refreshToken: createTokenHash(refreshToken),
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          ipAddress: getClientIp(req),
        },
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    } catch (sessionError) {
      logger.warn('Session create failed (non-blocking):', sessionError);
    }

    // Cookie olarak refresh token'ı ayarla
    try {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
      });
    } catch (cookieError) {
      logger.warn('Cookie ayarlama hatası (non-blocking):', cookieError);
    }

    // Başarılı yanıt - ÖNCE response gönder, sonra audit log
    const mobile = isMobileClient(req);
    
    logger.info('Login successful, sending response', { requestId, userId: user._id.toString(), mobile });
    
    // Response'u gönder
    res.status(200).json({
      success: true,
      accessToken,
      ...(mobile ? { refreshToken } : {}),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    
    logger.debug('Login response sent successfully', { requestId });
    
    // Audit log - Response gönderildikten SONRA (non-blocking)
    // Bu şekilde audit log hatası login'i engellemez
    setImmediate(() => {
      logLoginAction(user._id.toString(), req).catch((auditError) => {
        logger.warn('Login audit log oluşturulamadı (non-blocking):', auditError);
      });
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    const requestId = req.headers['x-request-id'] || 'unknown';
    logger.error('Login hatası:', {
      requestId,
      error: appError?.toString() || String(error),
      message: appError?.message,
      stack: appError?.stack,
      name: appError?.name,
      email: req.body?.email,
    });
    
    // Response henüz gönderilmediyse gönder
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: appError?.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
        ...(process.env.NODE_ENV === 'development' ? { details: appError?.stack } : {}),
      });
    } else {
      logger.warn('Login error but response already sent', { requestId });
    }
  }
};

// Kullanıcı çıkış işlemi
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshTokenRaw: string | undefined = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshTokenRaw) {
      const refreshHash = createTokenHash(refreshTokenRaw);
      await Session.updateMany(
        { refreshToken: refreshHash, isActive: true },
        { isActive: false }
      );
    }
  } catch (e) {
    logger.warn('Logout session invalidate failed (non-blocking):', e);
  }
  
  // Refresh token cookie'sini temizle
  res.clearCookie('refreshToken');
  
  res.status(200).json({
    success: true,
    message: 'Başarıyla çıkış yapıldı',
  });
};

// Token yenileme işlemi
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Web: cookie'den, Mobile: body'den (SecureStore) gelebilir
    const refreshTokenRaw: string | undefined = req.cookies?.refreshToken || req.body?.refreshToken;
    const mobile = isMobileClient(req) || Boolean(req.body?.refreshToken);
    
    if (!refreshTokenRaw) {
      return res.status(401).json({
        success: false,
        message: 'Yenileme token\'ı bulunamadı',
      });
    }
    
    // Token'ı doğrula - Merkezi JWT_REFRESH_SECRET kullan
    const { JWT_REFRESH_SECRET } = require('../utils/authTokens');
    const decoded = jwt.verify(
      refreshTokenRaw,
      JWT_REFRESH_SECRET
    ) as jwt.JwtPayload;
    
    // Session kontrolü (refresh token hash)
    const refreshHash = createTokenHash(refreshTokenRaw);
    const session = await Session.findOne({
      userId: decoded.id,
      refreshToken: refreshHash,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token',
      });
    }

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token',
      });
    }
    
    // Yeni token üret
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user as unknown as IUser);
    
    // Yeni refresh token'ı cookie olarak ayarla
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    // Session rotate
    try {
      await Session.updateOne(
        { _id: session._id },
        {
          token: createTokenHash(accessToken),
          refreshToken: createTokenHash(newRefreshToken),
          lastActivity: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      );
    } catch (sessionError) {
      logger.warn('Session rotate failed (non-blocking):', sessionError);
    }
    
    // Başarılı yanıt
    res.status(200).json({
      success: true,
      accessToken,
      ...(mobile ? { refreshToken: newRefreshToken } : {}),
    });
  } catch (error) {
    logger.error('Token yenileme hatası:', error);
    res.status(401).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token',
    });
  }
};

// Kullanıcı profil bilgilerini getirme
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Middleware'den gelen kullanıcı id'si
    const userId = req.user.id;
    
    // Kullanıcıyı bul (hassas bilgileri hariç tut)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Profil bilgileri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    });
  }
};

// Profil güncelleme
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Profil güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken bir hata oluştu',
    });
  }
};

// Şifre değiştirme
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre ve yeni şifre gereklidir',
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Yeni şifre en az 6 karakter olmalıdır',
      });
    }
    
    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    // Mevcut şifreyi doğrula
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mevcut şifre yanlış',
      });
    }
    
    // Yeni şifreyi güncelle (pre-save hook otomatik hash'leyecek)
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    });
  } catch (error) {
    logger.error('Şifre değiştirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilirken bir hata oluştu',
    });
  }
}; 