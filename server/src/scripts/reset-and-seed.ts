import 'dotenv/config';
import mongoose from 'mongoose';
import SiteContent from '../models/SiteContent';
import logger from '../utils/logger';
import connectDB from '../config/database';

// dotenv.config() call removed as import handles it.

const resetAndSeed = async () => {
    try {
        console.log("Checking Env Var: MONGO_URI is " + (process.env.MONGO_URI ? "DEFINED" : "UNDEFINED"));
        await connectDB();
        logger.info('Veritabanı bağlantısı başarılı. Temizlik başlıyor...');

        // 1. Koleksiyonu temizle
        await SiteContent.deleteMany({});
        logger.info('SiteContent koleksiyonu tamamen temizlendi.');

        // 2. Yeni varsayılan kayıtları oluştur
        // Vizyoner verilerle manuel seed işlemi (Schema defaultlarına ek olarak)

        // HERO Section
        await SiteContent.create({
            section: 'hero',
            content: {
                title: { tr: "Piksellerin Ötesinde Görüntü Çözümleri", en: "Visual Solutions Beyond Pixels" },
                subtitle: { tr: "Profesyonel Sahne Teknolojileri", en: "Professional Stage Technologies" },
                description: {
                    tr: "SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.",
                    en: "We offer professional visual direction and media server solutions for your events with SK Production."
                },
                buttonText: { tr: "Projelerimiz", en: "Our Projects" },
                buttonLink: "#projects",
                rotatingTexts: [
                    { tr: "Piksellerin Ötesinde", en: "Beyond Pixels" },
                    { tr: "Görüntü Yönetimi", en: "Visual Management" },
                    { tr: "Medya Server", en: "Media Server" }
                ]
            }
        });

        // ABOUT Section
        await SiteContent.create({
            section: 'about',
            content: {
                title: { tr: "Hakkımızda", en: "About Us" },
                description: {
                    tr: "10+ Yıllık sektör tecrübemizle, en son teknoloji medya sunucu sistemleri ve profesyonel ekibimizle hizmetinizdeyiz.",
                    en: "With over 10 years of industry experience, we are at your service with state-of-the-art media server systems and our professional team."
                },
                stats: [
                    { label: { tr: "Sektör Tecrübesi", en: "Industry Experience" }, value: "9+ Yıl" },
                    { label: { tr: "Tamamlanan Proje", en: "Completed Projects" }, value: "250+" }
                ]
            }
        });

        // OTHER Sections (Schema default relies on empty content for now, or minimal init)
        const otherSections = ['services', 'contact', 'footer', 'social'];
        for (const section of otherSections) {
            await SiteContent.create({ section, content: {} });
        }

        logger.info('Sistem "Visionary" verileriyle sıfırdan inşa edildi.');
        process.exit(0);
    } catch (error) {
        logger.error('Sıfırlama hatası:', error);
        process.exit(1);
    }
};

resetAndSeed();
