import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { SiteContent } from '../models/SiteContent';
import { SystemSetting } from '../models/SystemSetting';
import Service from '../models/Service';
import ShowcaseProject from '../models/ShowcaseProject';
import Contact from '../models/Contact';
import About from '../models/About';

dotenv.config({ path: path.join(process.cwd(), '.env') });

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error('FATAL: MONGO_URI veya MONGODB_URI bulunamadı.');
  process.exit(1);
}

const defaultSections = [
  {
    section: 'hero',
    data: {
      title: 'Profesyonel Prodüksiyon Deneyimi',
      subtitle:
        'Sıradan görüntülerin ötesine geçin. İleri teknoloji ekipmanlarımız, yaratıcı kurgu tekniklerimiz ve profesyonel bakış açımızla; en özel anlarınızı ve kurumsal vizyonunuzu sinematik bir başyapıta dönüştürüyoruz. Çünkü her hikaye, kusursuz anlatılmayı hak eder.',
      description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
      buttonText: 'Projelerimiz',
      buttonLink: '#projects',
      rotatingTexts: [
        'Piksellerin Ötesinde Bir Dünya',
        'Yaratıcılığın Sınırlarını Zorlayın',
        'Sanat ve Teknolojinin Buluşması',
        'Markanız İçin Yaratıcı Çözümler',
      ],
      videoUrl: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1769730001/skproduction/library/xekeqyyrwf7zlwvwgmtg.mp4',
      backgroundVideo: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1769730001/skproduction/library/xekeqyyrwf7zlwvwgmtg.mp4',
      availableVideos: [],
    },
    isActive: true,
  },
  {
    section: 'services',
    data: {
      title: 'Hizmetlerimiz & Ekipmanlarımız',
      subtitle: 'Video Engineering ve Teknik Prodüksiyon Sistemleri',
      services: [
        {
          title: 'Medya Sunucu Operatörlüğü',
          description: 'Karmaşık akışa sahip etkinliklerde, timeline tabanlı içerik yönetimi ve canlı yayın senkronizasyonu.',
          icon: 'Activity',
          category: 'VIDEO PROCESSING',
          details: [
            'Canlı İçerik (Live Content) Yönetimi',
            'Timecode Senkronizasyonu',
            'Yedekli (Redundant) Sistem İşletimi',
          ],
          order: 0,
        },
        {
          title: 'Analog Way Aquilon C+',
          description: '4K/8K içerikler için ultra düşük gecikmeli, endüstri standardı görüntü işleme ve sunum sistemi.',
          icon: 'Layers',
          category: 'VIDEO PROCESSING',
          details: [
            '4K60Hz 4:4:4 İşleme Kapasitesi',
            '10-bit HDR Desteği',
            'Ultra Düşük Gecikme (Low Latency)',
            'Gerçek Zamanlı Layer Yönetimi',
          ],
          order: 1,
        },
        {
          title: 'Pixel Mapping & Canvas Yönetimi',
          description: 'Standart dışı, yaratıcı LED yerleşimlerinin dijital ortamda haritalanması ve tek bir tuval (canvas) olarak yönetilmesi.',
          icon: 'Monitor',
          category: 'TECHNICAL DESIGN & SIMULATION',
          details: [
            'Custom Resolution (Özel Çözünürlük) Çalışma',
            'Multi-Screen (Çoklu Ekran) Senkronizasyonu',
            'Piksel/Piksel Hassas Yerleşim',
          ],
          order: 2,
        },
        {
          title: 'Dataton WATCHOUT 7',
          description: 'Çoklu ekranlı projeler, 3D mapping ve geniş yüzeyli projeksiyonlar için profesyonel medya sunucu sistemi.',
          icon: 'Server',
          category: 'VIDEO PROCESSING',
          details: [
            'Sınırsız Çözünürlük Desteği',
            '3D Projection Mapping',
            'Timeline Tabanlı İçerik Yönetimi',
            'Frame-Sync Senkronizasyon',
          ],
          order: 3,
        },
        {
          title: 'Sunum & İçerik Yönetimi',
          description: 'Üst düzey kongre ve lansmanlarda, sunum bilgisayarlarının (Main/Backup) switcher üzerinden kesintisiz yönetimi.',
          icon: 'Monitor',
          category: 'SIGNAL PROCESSING',
          details: [
            'DSK (Downstream Keyer) Kullanımı',
            'Speaker Timer Entegrasyonu',
            'Main/Backup PC Otomasyonu',
            'Farklı Format (Mac/PC) Desteği',
          ],
          order: 4,
        },
        {
          title: 'Teknik Projelendirme & Simülasyon',
          description: 'Etkinlik öncesinde tüm görüntü sistemlerinin CAD ortamında çizilmesi, sinyal akış şemalarının hazırlanması ve simüle edilmesi.',
          icon: 'Cpu',
          category: 'VIDEO PROCESSING',
          details: [
            'Sinyal Akış Diyagramları (Signal Flow)',
            'Pre-Visualization (Ön İzleme)',
          ],
          order: 5,
        },
      ],
      equipment: [],
    },
    isActive: true,
  },
  {
    section: 'about',
    data: {
      title: 'Hakkımızda',
      description:
        'SK Production, profesyonel ekipmanları ve deneyimli kadrosu ile en iyi görüntü kalitesine ulaşmanızı sağlar.',
      imageUrl: '/images/sk-logo.png',
      stats: [
        { label: 'Ekipler', value: '10+' },
        { label: 'Projeler', value: '500+' },
        { label: 'Yıllık Tecrübe', value: '15+' },
      ],
    },
    isActive: true,
  },
  {
    section: 'contact',
    data: {
      address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
      phone: '+90 544 644 93 04',
      email: 'info@skpro.com.tr',
      mapUrl: 'https://maps.google.com/maps?q=Zincirlidere%20Caddesi%20No%3A52%2FC%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed',
      workingHours: [
        'Pazartesi - Cuma: 09:00 - 18:00',
        'Cumartesi: 10:00 - 14:00',
        'Pazar: Kapalı',
      ],
      socialLinks: {
        instagram: 'https://www.instagram.com/skprotr/?hl=tr',
        linkedin: 'https://www.linkedin.com/company/skpro/',
      },
      latitude: 41.057984,
      longitude: 28.987117,
    },
    isActive: true,
  },
] as const;

const defaultServices = [
  {
    title: 'Medya Sunucu Operatörlüğü',
    category: 'VIDEO PROCESSING',
    description: 'Karmaşık akışa sahip etkinliklerde, timeline tabanlı içerik yönetimi ve canlı yayın senkronizasyonu.',
    icon: 'Activity',
    details: [
      'Canlı İçerik (Live Content) Yönetimi',
      'Timecode Senkronizasyonu',
      'Yedekli (Redundant) Sistem İşletimi',
    ],
    order: 0,
    isActive: true,
  },
  {
    title: 'Analog Way Aquilon C+',
    category: 'VIDEO PROCESSING',
    description: '4K/8K içerikler için ultra düşük gecikmeli, endüstri standardı görüntü işleme ve sunum sistemi.',
    icon: 'Layers',
    details: [
      '4K60Hz 4:4:4 İşleme Kapasitesi',
      '10-bit HDR Desteği',
      'Ultra Düşük Gecikme (Low Latency)',
      'Gerçek Zamanlı Layer Yönetimi',
    ],
    order: 1,
    isActive: true,
  },
  {
    title: 'Pixel Mapping & Canvas Yönetimi',
    category: 'TECHNICAL DESIGN & SIMULATION',
    description: 'Standart dışı, yaratıcı LED yerleşimlerinin dijital ortamda haritalanması ve tek bir tuval (canvas) olarak yönetilmesi.',
    icon: 'Monitor',
    details: [
      'Custom Resolution (Özel Çözünürlük) Çalışma',
      'Multi-Screen (Çoklu Ekran) Senkronizasyonu',
      'Piksel/Piksel Hassas Yerleşim',
    ],
    order: 2,
    isActive: true,
  },
  {
    title: 'Dataton WATCHOUT 7',
    category: 'VIDEO PROCESSING',
    description: 'Çoklu ekranlı projeler, 3D mapping ve geniş yüzeyli projeksiyonlar için profesyonel medya sunucu sistemi.',
    icon: 'Server',
    details: [
      'Sınırsız Çözünürlük Desteği',
      '3D Projection Mapping',
      'Timeline Tabanlı İçerik Yönetimi',
      'Frame-Sync Senkronizasyon',
    ],
    order: 3,
    isActive: true,
  },
  {
    title: 'Sunum & İçerik Yönetimi',
    category: 'SIGNAL PROCESSING',
    description: 'Üst düzey kongre ve lansmanlarda, sunum bilgisayarlarının (Main/Backup) switcher üzerinden kesintisiz yönetimi.',
    icon: 'Monitor',
    details: [
      'DSK (Downstream Keyer) Kullanımı',
      'Speaker Timer Entegrasyonu',
      'Main/Backup PC Otomasyonu',
      'Farklı Format (Mac/PC) Desteği',
    ],
    order: 4,
    isActive: true,
  },
  {
    title: 'Teknik Projelendirme & Simülasyon',
    category: 'VIDEO PROCESSING',
    description: 'Etkinlik öncesinde tüm görüntü sistemlerinin CAD ortamında çizilmesi, sinyal akış şemalarının hazırlanması ve simüle edilmesi.',
    icon: 'Cpu',
    details: [
      'Sinyal Akış Diyagramları (Signal Flow)',
      'Pre-Visualization (Ön İzleme)',
    ],
    order: 5,
    isActive: true,
  },
] as const;

const defaultShowcaseProjects: Array<{
  type: 'photo' | 'video';
  title: string;
  category: string;
  description?: string;
  coverUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  order: number;
  isActive: boolean;
}> = [];

const defaultLegacyContact = {
  address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
  phone: '+90 544 644 93 04',
  email: 'info@skpro.com.tr',
  mapUrl: 'https://maps.google.com/maps?q=Zincirlidere%20Caddesi%20No%3A52%2FC%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul&t=&z=16&ie=UTF8&iwloc=&output=embed',
  socialLinks: {
    instagram: 'https://www.instagram.com/skprotr/?hl=tr',
    linkedin: 'https://www.linkedin.com/company/skpro/',
  },
};

const defaultLegacyAbout = {
  title: 'SK Production Hakkında',
  description:
    'Profesyonel sahne, görüntü ve medya sistemlerinde deneyimli ekibimizle etkinliklerinize değer katıyoruz.',
  imageUrl: '/images/sk-logo.png',
  stats: [
    { label: 'Yıllık Etkinlik', value: '50+' },
    { label: 'Mutlu Müşteri', value: '100+' },
    { label: 'Ekip Üyesi', value: '15+' },
    { label: 'Tecrübe Yılı', value: '10+' },
  ],
};

const bootstrapPublicContent = async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Connecting to MongoDB for public content bootstrap...');
    await mongoose.connect(mongoUri);

    for (const section of defaultSections) {
      await SiteContent.findOneAndUpdate(
        { section: section.section },
        section,
        { upsert: true, new: true }
      );
      // eslint-disable-next-line no-console
      console.log(`Upserted section: ${section.section}`);
    }

    await Service.deleteMany({});
    await Service.insertMany(defaultServices);
    // eslint-disable-next-line no-console
    console.log('Upserted public services');

    await ShowcaseProject.deleteMany({});
    if (defaultShowcaseProjects.length > 0) {
      await ShowcaseProject.insertMany(defaultShowcaseProjects);
    }
    // eslint-disable-next-line no-console
    console.log('Upserted showcase projects');

    await SystemSetting.findOneAndUpdate(
      { key: 'maintenance_mode' },
      {
        key: 'maintenance_mode',
        value: { isMaintenanceMode: false },
        description: 'Site genel bakım modu ayarı',
      },
      { upsert: true, new: true }
    );
    // eslint-disable-next-line no-console
    console.log('Ensured maintenance mode is disabled');

    await Contact.findOneAndUpdate({}, defaultLegacyContact, { upsert: true, new: true });
    // eslint-disable-next-line no-console
    console.log('Upserted legacy CMS contact');

    const about = await About.findOne();
    if (!about) {
      await About.create(defaultLegacyAbout);
      // eslint-disable-next-line no-console
      console.log('Created legacy CMS about');
    } else if (!about.imageUrl) {
      await About.findByIdAndUpdate(about._id, defaultLegacyAbout, { new: true });
      // eslint-disable-next-line no-console
      console.log('Updated legacy CMS about');
    }

    // eslint-disable-next-line no-console
    console.log('Public content bootstrap completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Public content bootstrap failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

void bootstrapPublicContent();
