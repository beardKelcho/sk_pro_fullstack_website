import { Request, Response } from 'express';
import { AppError } from '../types/common';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';
import { Session } from '../models';
import { createTokenHash, decode2FAChallenge, generateTokenPair, isMobileClient } from '../utils/authTokens';

// Encryption/Decryption utilities for 2FA secrets
if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
  throw new Error('FATAL: ENCRYPTION_KEY environment variable is required in production');
}
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-only-encryption-key-32chars!!';
const ALGORITHM = 'aes-256-cbc';

function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptSecret(encryptedSecret: string): string {
  const parts = encryptedSecret.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * 2FA kurulumunu başlat - QR kod ve secret üret
 */
export const setup2FA = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    // Eğer zaten 2FA aktifse, yeni kurulum yapılamaz (önce disable edilmeli)
    if (user.is2FAEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten aktif. Yeni kurulum için önce 2FA\'yı devre dışı bırakın.',
      });
    }

    // TOTP secret oluştur
    const secret = speakeasy.generateSecret({
      name: `SK Production (${user.email})`,
      issuer: 'SK Production',
      length: 32,
    });

    // QR kod URL'i oluştur
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Secret'ı geçici olarak kaydet (henüz aktif değil)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.twoFactorSecret = secret.base32!;
    await user.save();

    // Backup kodları oluştur (10 adet)
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Backup kodlarını hash'le ve kaydet
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );
    user.backupCodes = hashedBackupCodes;
    await user.save();

    await logAction(req, 'UPDATE', 'User', userId as unknown as string, [
      { field: '2FA Setup', oldValue: 'disabled', newValue: 'setup initiated' },
    ]);

    res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes, // Sadece bu seferlik gösterilir
      message: '2FA kurulumu başlatıldı. QR kodu tarayın ve doğrulama kodunu girin.',
    });
  } catch (error: unknown) {
      const appError = error as AppError;
    logger.error('2FA kurulum hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || '2FA kurulumu sırasında bir hata oluştu',
    });
  }
};

/**
 * 2FA'yı doğrula ve aktif et
 */
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { token, backupCode } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!._id;
    
    const user = await User.findById(userId).select('+twoFactorSecret +backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA kurulumu yapılmamış. Önce setup endpoint\'ini çağırın.',
      });
    }

    let isValid = false;

    // TOTP token doğrulama
    if (token && user.twoFactorSecretHash) {
      try {
        const decryptedSecret = decryptSecret(user.twoFactorSecretHash);
        isValid = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token,
          window: 2, // ±2 adım tolerans
        });
      } catch (error) {
        logger.error('Secret çözme hatası:', error);
      }
    }

    // Backup kod doğrulama
    if (!isValid && backupCode && user.backupCodes) {
      for (let i = 0; i < user.backupCodes.length; i++) {
        const isBackupCodeValid = await bcrypt.compare(backupCode, user.backupCodes[i]);
        if (isBackupCodeValid) {
          isValid = true;
          // Kullanılan backup kodunu sil
          user.backupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu',
      });
    }

    // 2FA'yı aktif et
    user.is2FAEnabled = true;
    // Secret'ı şifrele ve sakla (TOTP doğrulama için gerekli)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    user.twoFactorSecretHash = encryptSecret(user.twoFactorSecret!);
    // Geçici secret'ı temizle
    user.twoFactorSecret = undefined;
    await user.save();

    await logAction(req, 'UPDATE', 'User', userId as unknown as string, [
      { field: '2FA Status', oldValue: 'disabled', newValue: 'enabled' },
    ]);

    res.status(200).json({
      success: true,
      message: '2FA başarıyla aktif edildi',
    });
  } catch (error: unknown) {
      const appError = error as AppError;
    logger.error('2FA doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || '2FA doğrulama sırasında bir hata oluştu',
    });
  }
};

/**
 * 2FA'yı devre dışı bırak
 */
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const { password, token, backupCode } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!._id;
    
    const user = await User.findById(userId).select('+twoFactorSecretHash +backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    if (!user.is2FAEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA zaten devre dışı',
      });
    }

    // Şifre doğrulama
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz şifre',
      });
    }

    // 2FA token veya backup kod doğrulama
    let isValid2FA = false;

    if (token && user.twoFactorSecretHash) {
      try {
        const decryptedSecret = decryptSecret(user.twoFactorSecretHash);
        isValid2FA = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token,
          window: 2,
        });
      } catch (error) {
        logger.error('Secret çözme hatası:', error);
      }
    }

    if (!isValid2FA && backupCode && user.backupCodes) {
      for (let i = 0; i < user.backupCodes.length; i++) {
        const isBackupCodeValid = await bcrypt.compare(backupCode, user.backupCodes[i]);
        if (isBackupCodeValid) {
          isValid2FA = true;
          user.backupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    // Şifre zorunlu, token veya backup kod önerilir
    if (isPasswordValid && (isValid2FA || !token && !backupCode)) {
      user.is2FAEnabled = false;
      user.twoFactorSecretHash = undefined;
      user.backupCodes = [];
      await user.save();

      await logAction(req, 'UPDATE', 'User', userId as unknown as string, [
        { field: '2FA Status', oldValue: 'enabled', newValue: 'disabled' },
      ]);

      return res.status(200).json({
        success: true,
        message: '2FA başarıyla devre dışı bırakıldı',
      });
    }

    return res.status(400).json({
      success: false,
      message: '2FA devre dışı bırakmak için şifre gereklidir',
    });
  } catch (error: unknown) {
      const appError = error as AppError;
    logger.error('2FA devre dışı bırakma hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || '2FA devre dışı bırakma sırasında bir hata oluştu',
    });
  }
};

/**
 * 2FA durumunu kontrol et
 */
export const get2FAStatus = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }

    res.status(200).json({
      success: true,
      is2FAEnabled: user.is2FAEnabled || false,
      hasBackupCodes: user.backupCodes && user.backupCodes.length > 0,
    });
  } catch (error: unknown) {
      const appError = error as AppError;
    logger.error('2FA durum kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || '2FA durumu kontrol edilemedi',
    });
  }
};

/**
 * Login sırasında 2FA doğrulama.
 * Artık email değil; login sonrası alınan challengeToken ile çalışır.
 * Bu token: imzalı JWT (5 dk), DB'de jti kayıtlı → replay korumalı, tek kullanımlık.
 */
export const verify2FALogin = async (req: Request, res: Response) => {
  try {
    const { challengeToken, token, backupCode } = req.body;

    if (!challengeToken || (!token && !backupCode)) {
      return res.status(400).json({
        success: false,
        message: 'challengeToken ve doğrulama kodu gereklidir',
      });
    }

    // Challenge token'ı doğrula
    const challenge = decode2FAChallenge(challengeToken);
    if (!challenge) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş 2FA challenge',
      });
    }

    // DB'den jti ve expiry kontrolü (replay protection)
    const user = await User.findById(challenge.userId)
      .select('+twoFactorSecretHash +backupCodes +pendingTwoFAChallenge');

    if (!user || !user.is2FAEnabled) {
      return res.status(401).json({
        success: false,
        message: '2FA aktif değil veya kullanıcı bulunamadı',
      });
    }

    const pending = user.pendingTwoFAChallenge;
    if (!pending || pending.jti !== challenge.jti || pending.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Challenge geçersiz veya zaten kullanılmış',
      });
    }

    // Challenge'ı hemen geçersiz kıl (tek kullanımlık)
    await User.updateOne({ _id: user._id }, { $unset: { pendingTwoFAChallenge: 1 } });

    let isValid = false;

    // TOTP token doğrulama
    if (token && user.twoFactorSecretHash) {
      try {
        const decryptedSecret = decryptSecret(user.twoFactorSecretHash);
        isValid = speakeasy.totp.verify({
          secret: decryptedSecret,
          encoding: 'base32',
          token,
          window: 2,
        });
      } catch (error) {
        logger.error('Secret çözme hatası:', error);
      }
    }

    // Backup kod doğrulama
    if (!isValid && backupCode && user.backupCodes) {
      for (let i = 0; i < user.backupCodes.length; i++) {
        const isBackupCodeValid = await bcrypt.compare(backupCode, user.backupCodes[i]);
        if (isBackupCodeValid) {
          isValid = true;
          // Kullanılan backup kodunu sil
          user.backupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz doğrulama kodu',
      });
    }

    // Token üret (2FA login tamamlandı)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { accessToken, refreshToken } = generateTokenPair(user as any as any);

    // Session oluştur
    try {
      await Session.create({
        userId: user._id,
        token: createTokenHash(accessToken),
        refreshToken: createTokenHash(refreshToken),
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          ipAddress: typeof req.ip === 'string' ? req.ip : undefined,
        },
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    } catch (sessionError) {
      logger.warn('Session create failed (non-blocking):', sessionError);
    }

    // Web için HttpOnly cookie — token body'de sadece mobile'a dönüyor (auth.controller.ts ile tutarlı)
    const cookieOpts = { httpOnly: true, secure: true, sameSite: 'none' as const, path: '/' };
    res.cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

    const mobile = isMobileClient(req);
    res.status(200).json({
      success: true,
      message: '2FA doğrulaması başarılı',
      accessToken,
      ...(mobile ? { refreshToken } : {}),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
      const appError = error as AppError;
    logger.error('2FA login doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      message: appError?.message || (error as Error)?.message || '2FA doğrulama sırasında bir hata oluştu',
    });
  }
};

