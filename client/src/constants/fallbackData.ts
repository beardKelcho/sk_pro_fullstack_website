import type { Project } from '@/components/home/Projects';
import { SiteContent } from '@/types/cms';

export const fallbackContent: SiteContent = {
  hero: {
    title: 'Profesyonel Prodüksiyon Deneyimi',
    subtitle: 'Sıradan görüntülerin ötesine geçin. İleri teknoloji ekipmanlarımız, yaratıcı kurgu tekniklerimiz ve profesyonel bakış açımızla; en özel anlarınızı ve kurumsal vizyonunuzu sinematik bir başyapıta dönüştürüyoruz. Çünkü her hikaye, kusursuz anlatılmayı hak eder.',
    description: 'SK Production ile etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
    buttonText: 'Projelerimiz',
    buttonLink: '#projects',
    rotatingTexts: [
      'Piksellerin Ötesinde Bir Dünya',
      'Yaratıcılığın Sınırlarını Zorlayın',
      'Sanat ve Teknolojinin Buluşması',
      'Markanız İçin Yaratıcı Çözümler'
    ],
    videoUrl: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1769730001/skproduction/library/xekeqyyrwf7zlwvwgmtg.mp4',
    backgroundVideo: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1769730001/skproduction/library/xekeqyyrwf7zlwvwgmtg.mp4'
  },
  about: {
    title: 'Hakkımızda',
    description: 'SK Production, profesyonel ekipmanları ve deneyimli kadrosu ile en iyi görüntü kalitesine ulaşmanızı sağlar.',
    imageUrl: '/images/sk-logo.png',
    stats: [
      { label: 'Ekipler', value: '10+', icon: 'users' },
      { label: 'Projeler', value: '500+', icon: 'check-circle' },
      { label: 'Yıllık Tecrübe', value: '15+', icon: 'calendar' }
    ]
  },
  services: {
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
      }
    ]
  },
  contact: {
    address: 'İstanbul, Türkiye',
    phone: '+90 544 644 93 04',
    email: 'info@skpro.com.tr',
    workingHours: ['Pazartesi - Cuma: 09:00 - 18:00', 'Cumartesi: 10:00 - 14:00', 'Pazar: Kapalı'],
    socialLinks: {
      instagram: 'https://instagram.com/skproduction',
      linkedin: 'https://linkedin.com/company/skproduction',
    }
  }
};

export const fallbackProjects: Project[] = [
  {
    _id: 'fallback-project-1',
    type: 'photo',
    title: 'TRT Tabii Dubai Lansman',
    category: 'LANSMAN',
    coverUrl: '/restored-projects/project-1.png',
    order: 1,
  },
  {
    _id: 'fallback-project-2',
    type: 'photo',
    title: '29 Ekim Cumhuriyet Bayramı 100. Yıl Kutlamaları',
    category: 'KONSER',
    coverUrl: '/restored-projects/project-2.png',
    order: 2,
  },
  {
    _id: 'fallback-project-3',
    type: 'photo',
    title: 'YouTube Influencer Etkinliği',
    category: 'LANSMAN',
    coverUrl: '/restored-projects/project-3.png',
    order: 3,
  },
  {
    _id: 'fallback-project-4',
    type: 'photo',
    title: 'Haliç Kongre Merkezi',
    category: 'KONGRE',
    coverUrl: '/restored-projects/project-4.png',
    order: 4,
  },
  {
    _id: 'fallback-project-5',
    type: 'photo',
    title: '2025 Kültür Yolu Festivali',
    category: 'KONSER',
    coverUrl: '/restored-projects/project-5.png',
    order: 5,
  },
  {
    _id: 'fallback-project-6',
    type: 'photo',
    title: "19 Mayıs Atatürk'ü Anma Gençlik ve Spor Bayramı",
    category: 'KONSER',
    coverUrl: '/restored-projects/project-6.png',
    order: 6,
  },
];
