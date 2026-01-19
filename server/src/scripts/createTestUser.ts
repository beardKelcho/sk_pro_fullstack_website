import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import User from '../models/User';
import logger from '../utils/logger';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../../.env') });

const TEST_USER_EMAIL = 'test@skpro.com.tr';
const TEST_USER_PASSWORD = 'Test123!';
const TEST_USER_NAME = 'Test User';
const TEST_USER_ROLE = 'ADMIN';

const createTestUser = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/skproduction';
    
    logger.info('🔌 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(mongoUri);
    logger.info('✅ MongoDB bağlantısı başarılı');

    // Mevcut test kullanıcısını kontrol et
    let testUser = await User.findOne({ email: TEST_USER_EMAIL });
    
    if (testUser) {
      logger.info(`📝 Mevcut test kullanıcısı bulundu: ${TEST_USER_EMAIL}`);
      
      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(TEST_USER_PASSWORD, 10);
      
      // 2FA'yı kapat ve kullanıcıyı güncelle
      await User.updateOne(
        { _id: testUser._id },
        {
          $set: {
            password: hashedPassword,
            name: TEST_USER_NAME,
            role: TEST_USER_ROLE,
            isActive: true,
            is2FAEnabled: false,
            twoFactorSecret: undefined,
            twoFactorSecretHash: undefined,
            backupCodes: undefined,
          },
          $unset: {
            twoFactorSecret: '',
            twoFactorSecretHash: '',
            backupCodes: '',
          },
        }
      );
      
      logger.info(`✅ Test kullanıcısı güncellendi: ${TEST_USER_EMAIL}`);
      logger.info(`   Şifre: ${TEST_USER_PASSWORD}`);
      logger.info(`   Rol: ${TEST_USER_ROLE}`);
      logger.info(`   2FA: Kapalı`);
    } else {
      logger.info(`🆕 Yeni test kullanıcısı oluşturuluyor...`);
      
      // Yeni test kullanıcısı oluştur (pre-save hook otomatik hash'leyecek)
      testUser = await User.create({
        name: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD, // Pre-save hook otomatik hash'leyecek
        role: TEST_USER_ROLE,
        isActive: true,
        is2FAEnabled: false,
      });
      
      logger.info(`✅ Test kullanıcısı oluşturuldu: ${TEST_USER_EMAIL}`);
      logger.info(`   Şifre: ${TEST_USER_PASSWORD}`);
      logger.info(`   Rol: ${TEST_USER_ROLE}`);
      logger.info(`   2FA: Kapalı`);
    }

    // Kullanıcı bilgilerini doğrula
    const verifiedUser = await User.findOne({ email: TEST_USER_EMAIL });
    if (verifiedUser) {
      // Şifre doğrulaması için password field'ını select et
      const userWithPassword = await User.findOne({ email: TEST_USER_EMAIL }).select('+password');
      if (userWithPassword) {
        const passwordMatch = await userWithPassword.comparePassword(TEST_USER_PASSWORD);
        logger.info(`🔐 Şifre doğrulaması: ${passwordMatch ? '✅ Başarılı' : '❌ Başarısız'}`);
      }
      logger.info(`📊 Kullanıcı durumu:`);
      logger.info(`   - Aktif: ${verifiedUser.isActive ? '✅' : '❌'}`);
      logger.info(`   - 2FA: ${verifiedUser.is2FAEnabled ? '❌ Açık' : '✅ Kapalı'}`);
      logger.info(`   - Rol: ${verifiedUser.role}`);
    }

    await mongoose.connection.close();
    logger.info('🔌 MongoDB bağlantısı kapatıldı');
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('✅ Test kullanıcısı hazır!');
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info(`📧 Email: ${TEST_USER_EMAIL}`);
    logger.info(`🔑 Şifre: ${TEST_USER_PASSWORD}`);
    logger.info(`👤 Rol: ${TEST_USER_ROLE}`);
    logger.info(`🔒 2FA: Kapalı`);
    logger.info('');
    logger.info('Cypress testlerinde bu bilgileri kullanabilirsiniz:');
    logger.info(`  cy.loginAsUser('${TEST_USER_EMAIL}', '${TEST_USER_PASSWORD}')`);
    logger.info('═══════════════════════════════════════════════════════════');
    
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Test kullanıcısı oluşturma hatası:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

createTestUser();
