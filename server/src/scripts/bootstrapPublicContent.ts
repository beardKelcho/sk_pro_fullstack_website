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
  console.error('FATAL: MONGO_URI veya MONGODB_URI bulunamadi.');
  process.exit(1);
}

const defaultSections = [
  {
    section: 'hero',
    data: {
      title: 'Piksellerin Otesinde, Kesintisiz Goruntu Yonetimi',
      subtitle: 'Profesyonel Goruntu ve Medya Cozumleri',
      description:
        "2017'den beri sektorun en karmasik projelerinde teknik beyin olarak yer aliyoruz. Goruntu yonetimi, medya server cozumleri ve uzman ekip.",
      buttonText: 'Projelerimiz',
      buttonLink: '#projects',
      rotatingTexts: [
        'Piksellerin Otesinde, Kesintisiz Goruntu Yonetimi',
        'Medya Server ve Goruntu Rejisi Cozumleri',
        'Gorsel Mukemmellikte Uzman Ekip',
      ],
      availableVideos: [],
    },
    isActive: true,
    order: 0,
  },
  {
    section: 'services',
    data: {
      title: 'Profesyonel Goruntu ve Medya Cozumleri',
      subtitle:
        'Etkinlikleriniz icin dunya standartlarinda medya sunuculari, goruntu isleme teknolojileri ve uzman reji hizmetleri sunuyoruz.',
      services: [
        {
          title: 'Uzman Ekip ve Teknik Yonetim',
          description:
            "2017'den beri sektorun en karmasik projelerinde teknik beyin olarak yer aliyoruz. Sadece cihaz saglamiyor, projenizin tum goruntu mimarisini uctan uca yonetiyoruz.",
          icon: 'screen',
          order: 0,
        },
        {
          title: 'Goruntu Rejisi ve Isleme',
          description:
            'Analog Way Aquilon RS serisi ile cok katmanli goruntu yonetimi. Buyuk LED ekranlarda sifir gecikmeli ve kusursuz sinyal isleme.',
          icon: 'video',
          order: 1,
        },
        {
          title: 'Medya Server Cozumleri',
          description:
            'Dataton Watchout uzmanligiyla milimetrik icerik senkronizasyonu. Buyuk yuzeylerde ileri seviye mapping ve coklu ekran yonetimi.',
          icon: 'led',
          order: 2,
        },
      ],
      equipment: [
        {
          title: 'Goruntu Rejisi Sistemleri',
          items: [
            { name: 'Analog Way Aquilon RS4', description: '4K/8K giris-cikis yonetimi' },
            { name: 'Barco E2 Gen 2', description: '4K screen management system' },
          ],
          order: 0,
        },
      ],
    },
    isActive: true,
    order: 1,
  },
  {
    section: 'about',
    data: {
      title: 'Hakkimizda',
      description:
        "SK Production olarak goruntu teknolojileri alaninda uctan uca cozumler uretiyor, teknolojiyi sanatla bulusturuyoruz. 2017'den beri teknik prodüksiyon projelerinde güvenilir cozum ortagi olarak calisiyoruz.",
      stats: [
        { label: 'Tamamlanan Proje', value: '500+' },
        { label: 'Mutlu Musteri', value: '100+' },
      ],
    },
    isActive: true,
    order: 2,
  },
  {
    section: 'contact',
    data: {
      address: 'Zincirlidere Caddesi No:52/C Sisli/Istanbul',
      phone: '+90 212 XXX XX XX',
      email: 'info@skpro.com.tr',
      workingHours: [
        'Pazartesi - Cuma: 09:00 - 18:00',
        'Cumartesi: 10:00 - 14:00',
        'Pazar: Kapali',
      ],
      socialLinks: {},
      latitude: 41.057984,
      longitude: 28.987117,
    },
    isActive: true,
    order: 3,
  },
] as const;

const defaultServices = [
  {
    title: 'Video Produksiyon',
    category: 'Genel',
    description: 'Yuksek kaliteli video cekim ve kurgu hizmetleri.',
    icon: 'Monitor',
    details: ['Yuksek kaliteli video cekim ve kurgu hizmetleri.'],
    order: 0,
    isActive: true,
  },
  {
    title: 'Ekipman Kiralama',
    category: 'Genel',
    description: 'En son teknoloji kamera ve isik ekipmanlari.',
    icon: 'Monitor',
    details: ['En son teknoloji kamera ve isik ekipmanlari.'],
    order: 1,
    isActive: true,
  },
  {
    title: 'Canli Yayin',
    category: 'Genel',
    description: 'Kesintisiz ve profesyonel canli yayin altyapisi.',
    icon: 'Monitor',
    details: ['Kesintisiz ve profesyonel canli yayin altyapisi.'],
    order: 2,
    isActive: true,
  },
];

const defaultShowcaseProjects = [
  {
    type: 'photo' as const,
    title: 'Kurumsal Lansman ve Sahne Kurulumu',
    category: 'Kurumsal Etkinlik',
    description: 'Kurumsal etkinlikler icin goruntu yonetimi, sahne akisi ve icerik playback cozumleri.',
    order: 1,
    isActive: true,
  },
  {
    type: 'photo' as const,
    title: 'Festival Goruntu Rejisi',
    category: 'Festival',
    description: 'Coklu kamera ve medya server kurgusuyla buyuk olcekli festival prodüksiyon destegi.',
    order: 2,
    isActive: true,
  },
  {
    type: 'video' as const,
    title: 'Canli Yayin Produksiyonu',
    category: 'Canli Yayin',
    description: 'Etkinlik, lansman ve hibrit yayinlar icin kesintisiz canli yayin altyapisi.',
    order: 3,
    isActive: true,
  },
];

const defaultLegacyContact = {
  address: 'Istanbul, Turkiye',
  phone: '+90 212 XXX XX XX',
  email: 'info@skpro.com.tr',
  mapUrl: '',
  socialLinks: {},
};

const defaultLegacyAbout = {
  title: 'SK Production Hakkinda',
  description:
    'Profesyonel sahne, goruntu ve medya sistemlerinde deneyimli ekibimizle etkinliklerinize deger katiyoruz.',
  imageUrl: '/images/sk-logo.png',
  stats: [
    { label: 'Yillik Etkinlik', value: '50+' },
    { label: 'Mutlu Musteri', value: '100+' },
    { label: 'Ekip Uyesi', value: '15+' },
    { label: 'Tecrube Yili', value: '10+' },
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
      const existing = await SiteContent.findOne({ section: section.section });
      if (!existing) {
        await SiteContent.create(section);
        // eslint-disable-next-line no-console
        console.log(`Created default section: ${section.section}`);
      }
    }

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(defaultServices);
      // eslint-disable-next-line no-console
      console.log('Inserted default public services');
    }

    const showcaseCount = await ShowcaseProject.countDocuments();
    if (showcaseCount === 0) {
      await ShowcaseProject.insertMany(defaultShowcaseProjects);
      // eslint-disable-next-line no-console
      console.log('Inserted default showcase projects');
    }

    const maintenanceSetting = await SystemSetting.findOne({ key: 'maintenance_mode' });
    if (!maintenanceSetting) {
      await SystemSetting.create({
        key: 'maintenance_mode',
        value: { isMaintenanceMode: false },
        description: 'Site genel bakim modu ayari',
      });
      // eslint-disable-next-line no-console
      console.log('Created default maintenance setting');
    }

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
