import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteContent from '../models/SiteContent';
import logger from '../utils/logger';
import connectDB from '../config/database';

dotenv.config();

const resetAndSeed = async () => {
    try {
        await connectDB();
        logger.info('Veritabanı bağlantısı başarılı. Temizlik başlıyor...');

        // 1. Koleksiyonu temizle
        await SiteContent.deleteMany({});
        logger.info('SiteContent koleksiyonu tamamen temizlendi.');

        // 2. Yeni varsayılan kayıtları oluştur (Schema defaultları devreye girecek)
        const sections = ['hero', 'about', 'services', 'contact', 'footer', 'social'];

        for (const section of sections) {
            // Boş içerik ile oluşturuyoruz, Schema'daki default fonksiyonlar "Visionary" metinleri dolduracak
            await SiteContent.create({ section, content: {} });
            logger.info(`${section} bölümü varsayılan vizyoner içerikle yeniden oluşturuldu.`);
        }

        logger.info('Sistem fabrikasyon ayarlarına başarıyla döndürüldü. (Visionary Mode Active)');
        process.exit(0);
    } catch (error) {
        logger.error('Sıfırlama hatası:', error);
        process.exit(1);
    }
};

resetAndSeed();
