import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SiteContent from '../models/SiteContent';
import path from 'path';

// Load env vars
// Try loading from CWD (root of server)
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Fallback debug
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is undefined. Attempting default path...');
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is still undefined. Current CWD:', process.cwd());
    console.error('Environment variables loaded:', process.env);
    process.exit(1);
}

const seedSiteContent = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // 1. HERO CONTENT
        console.log('Upserting Hero content...');
        await SiteContent.findOneAndUpdate(
            { section: 'hero' },
            {
                section: 'hero',
                content: {
                    title: 'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi',
                    subtitle: 'Profesyonel Görüntü ve Medya Çözümleri',
                    description: "2017'den beri sektörün en karmaşık projelerinde 'teknik beyin' olarak yer alıyoruz. Görüntü yönetimi, medya server çözümleri ve uzman ekip.",
                    buttonText: 'Projelerimiz',
                    buttonLink: '#projects',
                    rotatingTexts: [
                        'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi',
                        'Medya Server ve Görüntü Rejisi Çözümleri',
                        'Görsel Mükemmellikte Uzman Ekip'
                    ],
                    availableVideos: []
                },
                isActive: true,
                order: 0
            },
            { upsert: true, new: true }
        );

        // 2. SERVICES & EQUIPMENT (Unified Section)
        console.log('Upserting Services & Equipment content...');
        await SiteContent.findOneAndUpdate(
            { section: 'services-equipment' },
            {
                section: 'services-equipment',
                content: {
                    title: 'Profesyonel Görüntü ve Medya Çözümleri',
                    subtitle: 'Etkinlikleriniz için dünya standartlarında medya sunucuları, görüntü işleme teknolojileri ve uzman reji hizmetleri sunuyoruz.',
                    services: [
                        {
                            title: 'Uzman Ekip & Teknik Yönetim',
                            description: "2017'den beri sektörün en karmaşık projelerinde 'teknik beyin' olarak yer alıyoruz. Sadece cihaz sağlamıyor, projenizin tüm görüntü mimarisini uçtan uca yönetiyoruz.",
                            icon: 'screen',
                            order: 0
                        },
                        {
                            title: 'Görüntü Rejisi & İşleme',
                            description: "Analog Way Aquilon RS serisi ile çok katmanlı görüntü yönetimi. Dev LED ekranlarda 8K çözünürlüğe kadar sıfır gecikmeli ve kusursuz sinyal işleme.",
                            icon: 'video',
                            order: 1
                        },
                        {
                            title: 'Medya Server Çözümleri',
                            description: "Dataton Watchout uzmanlığıyla milimetrik içerik senkronizasyonu. Devasa yüzeylerde ileri seviye mapping ve çoklu ekran yönetim çözümleri.",
                            icon: 'led',
                            order: 2
                        }
                    ],
                    equipment: [
                        {
                            title: 'Görüntü Rejisi Sistemleri',
                            items: [
                                { name: 'Analog Way Aquilon RS4', description: '4K/8K 24 Giriş / 16 Çıkış' },
                                { name: 'Barco E2 Gen 2', description: '4K Screen Management System' }
                            ],
                            order: 0
                        }
                    ],
                    order: 1
                },
                isActive: true
            },
            { upsert: true, new: true }
        );

        // 3. ABOUT (Using 'about' key)
        console.log('Upserting About content...');
        await SiteContent.findOneAndUpdate(
            { section: 'about' },
            {
                section: 'about',
                content: {
                    title: 'Hakkımızda',
                    description: "SK Production olarak, görüntü teknolojileri alanında uçtan uca çözümler üreten, teknolojiyi sanatla buluşturan bir teknik prodüksiyon şirketiyiz.\n\n2017 yılında yola çıktığımız ilk günden beri, standartların ötesine geçmeyi hedefledik. Sadece ekipman kiralayan bir firma değil, projenizin 'teknik zekası' olmayı amaçlıyoruz.",
                    stats: [
                        { label: 'Tamamlanan Proje', value: '500+' },
                        { label: 'Mutlu Müşteri', value: '100+' }
                    ]
                },
                isActive: true,
                order: 2
            },
            { upsert: true, new: true }
        );

        // 4. CONTACT
        console.log('Upserting Contact content...');
        await SiteContent.findOneAndUpdate(
            { section: 'contact' },
            {
                section: 'contact',
                content: {
                    address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
                    phone: '+90 555 555 55 55',
                    email: 'info@skproduction.com',
                    latitude: 41.057984,
                    longitude: 28.987117
                },
                isActive: true,
                order: 3
            },
            { upsert: true, new: true }
        );

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedSiteContent();
