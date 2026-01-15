import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { IUser } from '../models/User';
import logger from '../utils/logger';
import { logAction } from '../utils/auditLogger';

// JWT token üretme fonksiyonu
const generateToken = (user: IUser) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  // Access token oluşturma (kısa ömürlü)
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'sk-production-secret',
    { expiresIn: '1h' }
  );

  // Refresh token oluşturma (uzun ömürlü)
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'sk-production-refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Kullanıcı giriş işlemi
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir',
      });
    }

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });
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
    const { accessToken, refreshToken } = generateToken(user);

    // Cookie olarak refresh token'ı ayarla
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    // Audit log - Login
    await logAction(req, 'LOGIN', 'System', user._id.toString());
    
    // Başarılı yanıt
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    });
  }
};

// Kullanıcı çıkış işlemi
export const logout = async (req: Request, res: Response) => {
  // Audit log - Logout
  if (req.user) {
    await logAction(req, 'LOGOUT', 'System', (req.user as any).id || (req.user as any)._id?.toString() || 'unknown');
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
    // Cookie'den refresh token'ı al
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Yenileme token\'ı bulunamadı',
      });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'sk-production-refresh-secret'
    ) as jwt.JwtPayload;
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token',
      });
    }
    
    // Yeni token üret
    const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
    
    // Yeni refresh token'ı cookie olarak ayarla
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });
    
    // Başarılı yanıt
    res.status(200).json({
      success: true,
      accessToken,
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