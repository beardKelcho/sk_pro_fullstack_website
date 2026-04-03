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
      title: 'Hizmetlerimiz',
      subtitle: 'Size özel profesyonel çözümler',
      services: [
        {
          title: 'Video Prodüksiyon',
          description: 'Yüksek kaliteli video çekim ve kurgu hizmetleri.',
          icon: 'screen',
          order: 0,
        },
        {
          title: 'Ekipman Kiralama',
          description: 'En son teknoloji kamera ve ışık ekipmanları.',
          icon: 'video',
          order: 1,
        },
        {
          title: 'Canlı Yayın',
          description: 'Kesintisiz ve profesyonel canlı yayın altyapısı.',
          icon: 'led',
          order: 2,
        },
      ],
      equipment: [
        {
          title: 'Sistem Altyapımız',
          items: [
            { name: 'Analog Way Aquilon RS4', description: '4K/8K Sinyal Yönetimi ve Kesintisiz Geçiş Sistemi' },
            { name: 'Dataton Watchpax / Watchout 6', description: 'Gelişmiş Mapping ve Çoklu Ekran Playback Sistemi' },
            { name: 'Barco E2 Gen 2 / S3-4K', description: 'Gelişmiş Görüntü İşleme ve Çoklu Çıkış Rejisi' }
          ],
          order: 0,
        },
      ],
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
      phone: '+90 532 123 4567',
      email: 'info@skpro.com.tr',
      workingHours: [
        'Pazartesi - Cuma: 09:00 - 18:00',
        'Cumartesi: 10:00 - 14:00',
        'Pazar: Kapalı',
      ],
      socialLinks: {},
      latitude: 41.057984,
      longitude: 28.987117,
    },
    isActive: true,
  },
] as const;

const defaultServices = [
  {
    title: 'Video Prodüksiyon',
    category: 'Genel',
    description: 'Yüksek kaliteli video çekim ve kurgu hizmetleri.',
    icon: 'Monitor',
    details: [
      'Yüksek kaliteli video çekim ve kurgu hizmetleri.',
    ],
    order: 0,
    isActive: true,
  },
  {
    title: 'Ekipman Kiralama',
    category: 'Genel',
    description: 'En son teknoloji kamera ve ışık ekipmanları.',
    icon: 'Server',
    details: [
      'En son teknoloji kamera ve ışık ekipmanları.',
    ],
    order: 1,
    isActive: true,
  },
  {
    title: 'Canlı Yayın',
    category: 'Genel',
    description: 'Kesintisiz ve profesyonel canlı yayın altyapısı.',
    icon: 'Activity',
    details: [
      'Kesintisiz ve profesyonel canlı yayın altyapısı.',
    ],
    order: 2,
    isActive: true,
  },
] as const;

const defaultShowcaseProjects = [
  {
    type: 'photo' as const,
    title: 'Kurumsal Lansman ve Sahne Kurulumu',
    category: 'Kurumsal Etkinlik',
    description: 'Kurumsal etkinliklerde görüntü yönetimi, sahne akışı ve içerik playback çözümleri.',
    order: 1,
    isActive: true,
  },
  {
    type: 'photo' as const,
    title: 'Festival Görüntü Rejisi',
    category: 'Festival',
    description: 'Çoklu kamera ve medya server kurgusuyla büyük ölçekli festival prodüksiyon desteği.',
    order: 2,
    isActive: true,
  },
  {
    type: 'video' as const,
    title: 'Canlı Yayın Prodüksiyonu',
    category: 'Canlı Yayın',
    description: 'Etkinlik, lansman ve hibrit yayınlar için kesintisiz canlı yayın altyapısı.',
    order: 3,
    isActive: true,
  },
] as const;

const defaultLegacyContact = {
  address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
  phone: '+90 532 123 4567',
  email: 'info@skpro.com.tr',
  mapUrl: 'https://www.google.com/maps?q=Zincirlidere%20Caddesi%20No%3A52%2FC%20%C5%9Ei%C5%9Fli%20%C4%B0stanbul&output=embed',
  socialLinks: {},
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

const containsPlaceholder = (value?: string) => {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes('example.com') ||
    normalized.includes('instagram.com/example') ||
    normalized.includes('linkedin.com/company/example') ||
    normalized.includes('new york') ||
    normalized.includes('xxx xxx')
  );
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

    const existingServices = await Service.find().sort({ order: 1, createdAt: 1 });
    for (const [index, service] of defaultServices.entries()) {
      const existing = existingServices[index];
      if (existing) {
        await Service.findByIdAndUpdate(existing._id, service, { new: true });
      } else {
        await Service.create(service);
      }
    }
    // eslint-disable-next-line no-console
    console.log('Upserted public services');

    const existingShowcaseProjects = await ShowcaseProject.find().sort({ order: 1, createdAt: 1 });
    for (const [index, project] of defaultShowcaseProjects.entries()) {
      const existing = existingShowcaseProjects[index];
      if (existing) {
        await ShowcaseProject.findByIdAndUpdate(existing._id, project, { new: true });
      } else {
        await ShowcaseProject.create(project);
      }
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

    const contact = await Contact.findOne();
    if (!contact) {
      await Contact.create(defaultLegacyContact);
      // eslint-disable-next-line no-console
      console.log('Created legacy CMS contact');
    } else if (
      containsPlaceholder(contact.address) ||
      containsPlaceholder(contact.phone) ||
      containsPlaceholder(contact.email) ||
      containsPlaceholder(contact.mapUrl) ||
      containsPlaceholder(contact.socialLinks?.instagram) ||
      containsPlaceholder(contact.socialLinks?.linkedin)
    ) {
      await Contact.findByIdAndUpdate(contact._id, defaultLegacyContact, { new: true });
      // eslint-disable-next-line no-console
      console.log('Updated legacy CMS contact placeholders');
    }

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
