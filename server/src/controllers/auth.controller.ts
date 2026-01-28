import { Request, Response } from 'express';
import authService, { LoginResult, RefreshResult } from '../services/auth.service';
import logger from '../utils/logger';
import { logLoginAction } from '../utils/auditLogger';
import { isMobileClient } from '../utils/authTokens';
import { AppError, AuthenticatedRequest } from '../types/common';

const getClientIp = (req: Request): string => {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  if (Array.isArray(xf) && xf.length) return xf[0];
  return (req.ip || 'unknown');
};

export class AuthController {
  // Kullanıcı giriş işlemi
  async login(req: Request, res: Response): Promise<Response | void> {
    const requestId = (req.headers['x-request-id'] as string) || 'unknown';
    logger.info('Login attempt started', { requestId, email: req.body?.email ? 'provided' : 'missing' });

    try {
      const { email, password } = req.body;

      // Manual validation removed (handled by Zod middleware)

      const ip = getClientIp(req);
      const userAgent = (req.headers['user-agent'] as string) || 'unknown';

      const result: LoginResult = await authService.login(email, password, ip, userAgent);

      // 2FA Handling
      if (result.requires2FA) {
        return res.status(200).json({
          success: true,
          requires2FA: true,
          message: '2FA doğrulaması gerekiyor',
          email: result.user.email,
        });
      }

      // Safe access to tokens
      if (!result.tokens) {
        throw new AppError('Token üretilemedi', 500);
      }

      // Tokens
      const { accessToken, refreshToken } = result.tokens;
      const mobile = isMobileClient(req);

      try {
        // Cookie Options (User Requested: Always Secure/None)
        const cookieOptions = {
          httpOnly: true,
          secure: true, // Render'da zorunlu
          sameSite: 'none' as const, // Cross-domain için ŞART
          path: '/'
        };

        // Refresh Token Cookie
        res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        // Access Token Cookie
        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
      } catch (cookieError: unknown) {
        logger.warn('Cookie ayarlama hatası (non-blocking):', cookieError);
      }

      // Send Response
      logger.info('Login successful, sending response', { requestId, userId: result.user._id.toString(), mobile });

      res.status(200).json({
        success: true,
        accessToken,
        ...(mobile ? { refreshToken } : {}),
        user: {
          id: result.user._id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      });

      // Audit Log (Async)
      setImmediate(() => {
        logLoginAction(result.user._id.toString(), req).catch((auditError: unknown) => {
          logger.warn('Login audit log oluşturulamadı (non-blocking):', auditError);
        });
      });

    } catch (error: unknown) {
      const appError = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Unknown error');

      logger.error('Login hatası:', {
        requestId,
        error: appError.toString(),
        message: appError.message,
        stack: appError.stack,
        email: req.body?.email,
      });

      if (!res.headersSent) {
        const status = appError.statusCode || (appError.message.includes('Geçersiz') ? 401 : 500);
        return res.status(status).json({
          success: false,
          message: appError.message || 'Sunucu hatası',
        });
      }
    }
  }

  // Kullanıcı çıkış işlemi
  async logout(req: Request, res: Response): Promise<Response | void> {
    try {
      const refreshTokenRaw = (req.cookies?.refreshToken as string) || (req.body?.refreshToken as string);

      await authService.logout(refreshTokenRaw);

      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      return res.status(200).json({ success: true, message: 'Başarıyla çıkış yapıldı' });

    } catch (e: unknown) {
      logger.warn('Logout hatası:', e);
      // Still return success for logout to clear client state
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      return res.status(200).json({ success: true, message: 'Çıkış yapıldı' });
    }
  }

  // Token yenileme
  async refreshToken(req: Request, res: Response): Promise<Response | void> {
    try {
      const refreshTokenRaw = (req.cookies?.refreshToken as string) || (req.body?.refreshToken as string);
      const mobile = isMobileClient(req) || Boolean(req.body?.refreshToken);

      if (!refreshTokenRaw) {
        return res.status(401).json({ success: false, message: 'Yenileme token\'ı bulunamadı' });
      }

      const result: RefreshResult = await authService.refreshToken(refreshTokenRaw);

      // Cookie Options
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/'
      };

      // Set Cookie
      res.cookie('refreshToken', result.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      // Set Access Token Cookie
      res.cookie('accessToken', result.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

      return res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        ...(mobile ? { refreshToken: result.refreshToken } : {}),
      });

    } catch (error: unknown) {
      logger.error('Token yenileme hatası:', error);
      const message = error instanceof Error ? error.message : 'Geçersiz token';
      return res.status(401).json({ success: false, message });
    }
  }

  // Profil getir
  async getProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) throw new AppError('Yetkisiz', 401);

      const user = await authService.getProfile(userId);

      return res.status(200).json({ success: true, user });
    } catch (error: unknown) {
      logger.error('Profil bilgileri hatası:', error);
      const appError = error instanceof AppError ? error : new AppError('Sunucu hatası');
      return res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
    }
  }

  // Profil güncelle
  async updateProfile(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) throw new AppError('Yetkisiz', 401);

      const { name, email } = req.body;

      const user = await authService.updateProfile(userId, { name, email });
      return res.status(200).json({ success: true, user });
    } catch (error: unknown) {
      logger.error('Profil güncelleme hatası:', error);
      return res.status(500).json({ success: false, message: 'Profil güncellenirken bir hata oluştu' });
    }
  }

  // Şifre değiştir
  async changePassword(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) throw new AppError('Yetkisiz', 401);

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Mevcut şifre ve yeni şifre gereklidir' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Yeni şifre en az 6 karakter olmalıdır' });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      return res.status(200).json({ success: true, message: 'Şifre başarıyla değiştirildi' });

    } catch (error: unknown) {
      logger.error('Şifre değiştirme hatası:', error);
      const appError = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Hata oluştu');
      return res.status(appError.statusCode || 500).json({ success: false, message: appError.message });
    }
  }
}

export default new AuthController();