import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../utils/logger';

dotenv.config();

const ADMIN_SEED_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@example.com';
const ADMIN_SEED_NAME = process.env.ADMIN_SEED_NAME || 'Seed Admin';

const seedAdmin = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB bağlantısı başarılı');

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: ADMIN_SEED_EMAIL });
    
    if (existingAdmin) {
      logger.warn('Admin kullanıcı zaten mevcut');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Admin kullanıcı oluştur — şifre ADMIN_SEED_PASSWORD env var'dan alınır
    const seedPassword = process.env.ADMIN_SEED_PASSWORD;
    if (!seedPassword || seedPassword.length < 8) {
      logger.error('ADMIN_SEED_PASSWORD env var en az 8 karakter olmalıdır. Seed iptal edildi.');
      await mongoose.connection.close();
      process.exit(1);
    }
    const hashedPassword = await bcrypt.hash(seedPassword, 12);

    const admin = await User.create({
      name: ADMIN_SEED_NAME,
      email: ADMIN_SEED_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    });

    logger.info(`Admin kullanıcı oluşturuldu: ${admin.email}`);
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
