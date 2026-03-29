import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { Session } from '../models/Session';
import { CalendarIntegration } from '../models/CalendarIntegration';
import Webhook from '../models/Webhook';
import logger from '../utils/logger';

dotenv.config();

const cleanupAndReseedAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/skproduction';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB bağlantısı başarılı');

    // 1. Session, CalendarIntegration, Webhook tamamen temizle
    const sessionCount = await Session.countDocuments();
    await Session.deleteMany({});
    logger.info(`Session koleksiyonu temizlendi (${sessionCount} kayıt silindi)`);

    const calCount = await CalendarIntegration.countDocuments();
    await CalendarIntegration.deleteMany({});
    logger.info(`CalendarIntegration koleksiyonu temizlendi (${calCount} kayıt silindi)`);

    const webhookCount = await Webhook.countDocuments();
    await Webhook.deleteMany({});
    logger.info(`Webhook koleksiyonu temizlendi (${webhookCount} kayıt silindi)`);

    // 2. Admin dışındaki tüm kullanıcıları sil
    const deletedUsers = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    logger.info(`Admin olmayan kullanıcılar silindi (${deletedUsers.deletedCount} kayıt)`);

    // 3. Admin yoksa yeniden oluştur
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      logger.info(`Mevcut admin korundu: ${existingAdmin.email}`);
    } else {
      const seedPassword = process.env.ADMIN_SEED_PASSWORD;
      if (!seedPassword || seedPassword.length < 8) {
        logger.error(
          'ADMIN_SEED_PASSWORD env var en az 8 karakter olmalıdır. Admin seed iptal edildi.'
        );
        await mongoose.connection.close();
        process.exit(1);
      }
      const hashedPassword = await bcrypt.hash(seedPassword, 12);
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@skproduction.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      });
      logger.info(`Yeni admin kullanıcı oluşturuldu: ${admin.email}`);
      logger.warn('⚠️  LÜTFEN İLK GİRİŞTEN SONRA ŞİFREYİ DEĞİŞTİRİN!');
    }

    logger.info('Temizlik ve seed tamamlandı.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Cleanup hatası:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanupAndReseedAdmin();
