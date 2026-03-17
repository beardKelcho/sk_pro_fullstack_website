import { SiteContent } from '@/types/cms';

export const fallbackContent: SiteContent = {
  hero: {
    title: 'SK Production',
    subtitle: 'Profesyonel Görüntü Çözümleri',
    description: 'Profesyonel görüntü ve medya çözümleri ile projelerinize değer katıyoruz.',
    buttonText: 'Hizmetlerimiz',
    buttonLink: '#services',
  },
  about: {
    title: 'Hakkımızda',
    description: 'SK Production, profesyonel ekipmanları ve deneyimli kadrosu ile en iyi görüntü kalitesine ulaşmanızı sağlar.',
    stats: [
      { label: 'Ekipler', value: '10+', icon: 'users' },
      { label: 'Projeler', value: '500+', icon: 'check-circle' },
      { label: 'Yıllık Tecrübe', value: '15+', icon: 'calendar' }
    ]
  },
  services: {
    title: 'Hizmetlerimiz',
    subtitle: 'Size özel profesyonel çözümler',
    services: [
      { title: 'Video Prodüksiyon', description: 'Yüksek kaliteli video çekim ve kurgu hizmetleri.', icon: 'video' },
      { title: 'Ekipman Kiralama', description: 'En son teknoloji kamera ve ışık ekipmanları.', icon: 'camera' },
      { title: 'Canlı Yayın', description: 'Kesintisiz ve profesyonel canlı yayın altyapısı.', icon: 'broadcast-tower' }
    ]
  },
  contact: {
    address: 'İstanbul, Türkiye',
    phone: '+90 212 XXX XX XX',
    email: 'info@skpro.com.tr',
    workingHours: ['Pazartesi - Cuma: 09:00 - 18:00']
  }
};
