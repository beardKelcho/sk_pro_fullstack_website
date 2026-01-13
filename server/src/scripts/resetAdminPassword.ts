import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB bağlantısı başarılı');

    // Admin kullanıcıyı bul
    const admin = await User.findOne({ email: 'admin@skproduction.com' });
    
    if (!admin) {
      logger.error('Admin kullanıcı bulunamadı');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Şifreyi direkt olarak hash'le ve güncelle (pre-save hook'u bypass et)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin.password = hashedPassword;
    admin.isActive = true;
    admin.role = 'ADMIN';
    
    // Pre-save hook'unu bypass etmek için direkt update
    await User.updateOne(
      { _id: admin._id },
      { 
        $set: { 
          password: hashedPassword,
          isActive: true,
          role: 'ADMIN'
        } 
      }
    );

    logger.info(`Admin şifresi sıfırlandı: ${admin.email}`);
    logger.info('Yeni şifre: admin123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Şifre sıfırlama hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

resetAdminPassword();

