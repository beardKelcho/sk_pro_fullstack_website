import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SiteContent } from '../models/SiteContent';
import { SystemSetting } from '../models/SystemSetting';
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
        // eslint-disable-next-line no-console
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI as string);
        // eslint-disable-next-line no-console
        console.log('Connected to MongoDB');

        // 1. HERO CONTENT
        // eslint-disable-next-line no-console
        console.log('Upserting Hero content...');
        await SiteContent.findOneAndUpdate(
            { section: 'hero' },
            {
                section: 'hero',
                data: {
                    title: 'Piksellerin Ötesinde,\nKesintisiz Görüntü Yönetimi',
                    subtitle: 'Profesyonel Görüntü Rejisi ve Medya Çözümleri',
                    description: "SK Production olarak en büyük sahnelerde, en karmaşık projelerde 'teknik beyin' rolünü üstleniyoruz. Dünyanın en iyi marka ve sanatçıları için sıfır hata toleransıyla kusursuz görsel şovlar yaratmak bizim işimiz.",
                    buttonText: 'Projelerimizi İnceleyin',
                    buttonLink: '#projects',
                    rotatingTexts: [
                        'Kusursuz Görüntü Rejisi',
                        'İleri Seviye Medya Server Sistemleri',
                        'Devasa Sahnelerde Uçtan Uca Teknik Yönetim'
                    ],
                    availableVideos: []
                },
                isActive: true,
                order: 0
            },
            { upsert: true, new: true }
        );

        // 2. SERVICES & EQUIPMENT (Unified Section)
        // eslint-disable-next-line no-console
        console.log('Upserting Services & Equipment content...');
        await SiteContent.findOneAndUpdate(
            { section: 'services' },
            {
                section: 'services',
                data: {
                    title: 'Hizmetlerimiz ve Altyapımız',
                    subtitle: 'Sıradan bir etkinlik ile unutulmaz bir şov arasındaki fark, doğru teknolojiyi ustalıkla kullanmaktır. Size en iyisi için ihtiyacınız olan her şeyi sunuyoruz.',
                    services: [
                        {
                            title: 'Uzman Ekip & Danışmanlık',
                            description: "Sadece ekipman sağlamıyoruz. Projenizin kağıt üzerindeki tasarımından, son saniye alkışına kadar sahnedeki tüm teknik akışın kusursuz olmasını garantiye alan bir uzmanlık ekibiyiz.",
                            icon: 'screen',
                            order: 0
                        },
                        {
                            title: 'Görüntü Rejisi & İşleme',
                            description: "Analog Way Aquilon ve Barco serisi cihazlarımızla devasa LED ekranlarda sıfır gecikmeli, 8K çözünürlüklü ve çok katmanlı, kesintisiz bir sinyal yönetimi sağlıyoruz.",
                            icon: 'video',
                            order: 1
                        },
                        {
                            title: 'İleri Medya Server Çözümleri',
                            description: "Dataton Watchout uzmanlığımız sayesinde milimetrik piksel mapping, devasa içerik senkronizasyonu ve karmaşık çoklu-ekran kurgularını mükemmellik ile yönetiyoruz.",
                            icon: 'led',
                            order: 2
                        }
                    ],
                    equipment: [
                        {
                            title: 'Sistem Altyapımız',
                            items: [
                                { name: 'Analog Way Aquilon RS4', description: '4K/8K Sinyal Yönetimi ve Kesintisiz Geçiş Sistemi' },
                                { name: 'Dataton Watchpax / Watchout 6', description: 'Gelişmiş Mapping ve Çoklu Ekran Playback Sistemi' },
                                { name: 'Barco E2 Gen 2 / S3-4K', description: 'Gelişmiş Görüntü İşleme ve Çoklu Çıkış Rejisi' }
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
        // eslint-disable-next-line no-console
        console.log('Upserting About content...');
        await SiteContent.findOneAndUpdate(
            { section: 'about' },
            {
                section: 'about',
                data: {
                    title: 'Teknoloji ve Sanatın Buluştuğu Yer',
                    description: "SK Production olarak, teknolojinin sınırlarını zorlayarak sektördeki sıradanlaştırılmış çözümlerin dışına çıkıyoruz.\n\nSektörde yıllar içerisinde biriktirdiğimiz saha deneyimini, en güncel teknolojik ekipmanlarla harmanlayarak birleştiriyoruz. En zorlu sahnelerin ve devasa tasarımların ardındaki 'Görünmez Kahraman' olmaktan gurur duyuyoruz.",
                    stats: [
                        { label: 'Başarılı Proje', value: '450+' },
                        { label: 'Sektörel Deneyim', value: '14 Yıl' },
                        { label: 'Global Çözüm Ortakları', value: '25+' }
                    ]
                },
                isActive: true,
                order: 2
            },
            { upsert: true, new: true }
        );

        // 4. CONTACT
        // eslint-disable-next-line no-console
        console.log('Upserting Contact content...');
        await SiteContent.findOneAndUpdate(
            { section: 'contact' },
            {
                section: 'contact',
                data: {
                    address: 'İstanbul, Türkiye',
                    phone: '+90 544 644 93 04',
                    email: process.env.CONTACT_FORM_TO_EMAIL || 'info@skpro.com.tr',
                    latitude: 41.057984,
                    longitude: 28.987117,
                    socialLinks: {
                        instagram: 'https://instagram.com/skproduction',
                        linkedin: 'https://linkedin.com/company/skproduction'
                    }
                },
                isActive: true,
                order: 3
            },
            { upsert: true, new: true }
        );

        // 5. MAINTENANCE MODE — always force OFF for CI/test seeding
        // eslint-disable-next-line no-console
        console.log('Ensuring maintenance mode is OFF...');
        await SystemSetting.findOneAndUpdate(
            { key: 'maintenance_mode' },
            { key: 'maintenance_mode', value: { isMaintenanceMode: false }, description: 'Site genel bakım modu ayarı' },
            { upsert: true, new: true }
        );

        // eslint-disable-next-line no-console
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedSiteContent();
