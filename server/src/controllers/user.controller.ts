import { Request, Response } from 'express';
import { User } from '../models';
import mongoose from 'mongoose';
import { sendUserInviteEmail } from '../utils/emailService';
import { notifyUser } from '../utils/notificationService';
import logger from '../utils/logger';

// Tüm kullanıcıları listele
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const filters: any = {};
    
    if (role) {
      filters.role = role;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : (sort as string);
    const sortOrder = (sort as string).startsWith('-') ? -1 : 1;
    
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;
    
    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber),
      User.countDocuments(filters)
    ]);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      users,
    });
  } catch (error) {
    logger.error('Kullanıcıları listeleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenirken bir hata oluştu',
    });
  }
};

// Tek bir kullanıcının detaylarını getir
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }
    
    const user = await User.findById(id).select('-password');
    
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
    logger.error('Kullanıcı detayları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı detayları alınırken bir hata oluştu',
    });
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, isActive, phone, address, permissions } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'İsim, email ve şifre gereklidir',
      });
    }
    
    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor',
      });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'TEKNISYEN',
      isActive: isActive !== undefined ? isActive : true,
      phone: phone || undefined,
      address: address || undefined,
      permissions: permissions || [],
    });
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    // Kullanıcı davet email'i gönder (async, hata olsa bile devam et)
    const inviterName = req.user ? (req.user as any).name : 'Sistem';
    sendUserInviteEmail(
      user.email,
      user.name,
      inviterName,
      user.role,
      password // Geçici şifre (ilk oluşturulduğunda)
    ).catch(err => logger.error('Kullanıcı davet email gönderme hatası:', err));
    
    // Kullanıcıya hoş geldin bildirimi gönder
    notifyUser(
      user._id,
      'USER_INVITED',
      'SK Production\'a Hoş Geldiniz!',
      `${inviterName} sizi SK Production sistemine ${user.role} rolü ile ekledi.`,
      { role: user.role },
      false // Email zaten gönderildi
    ).catch(err => logger.error('Hoş geldin bildirimi gönderme hatası:', err));
    
    res.status(201).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    logger.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulurken bir hata oluştu',
    });
  }
};

// Kullanıcı güncelle
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, isActive, permissions } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }
    
    // Kullanıcıyı bul
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    // Güncelleme verilerini hazırla
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (permissions !== undefined) user.permissions = permissions;
    
    // Şifre varsa ve boş değilse güncelle (pre-save hook otomatik hash'leyecek)
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır',
        });
      }
      user.password = password; // Pre-save hook hash'leyecek
    }
    
    // Kullanıcıyı kaydet
    await user.save();
    
    // Şifreyi hariç tutarak yanıt döndür
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    
    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    logger.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken bir hata oluştu',
    });
  }
};

// Kullanıcı sil
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kullanıcı ID',
      });
    }
    
    // Kendi hesabını silmeye çalışıyor mu kontrol et
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz',
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    logger.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken bir hata oluştu',
    });
  }
};

