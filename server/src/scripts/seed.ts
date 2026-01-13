import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const seedAdmin = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB bağlantısı başarılı');

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: 'admin@skproduction.com' });
    
    if (existingAdmin) {
      logger.warn('Admin kullanıcı zaten mevcut');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Admin kullanıcı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@skproduction.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    });

    logger.info(`Admin kullanıcı oluşturuldu: ${admin.email}`);
    logger.info('Varsayılan şifre: admin123');
    logger.warn('⚠️  LÜTFEN İLK GİRİŞTEN SONRA ŞİFREYİ DEĞİŞTİRİN!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seed hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();

