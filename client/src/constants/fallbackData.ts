import type { Project } from '@/components/home/Projects';
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

export const fallbackProjects: Project[] = [
  {
    _id: 'fallback-project-1',
    type: 'photo',
    title: 'Kurumsal Lansman ve Sahne Kurulumu',
    category: 'Kurumsal Etkinlik',
    description: 'Kurumsal etkinlikler için görüntü yönetimi, sahne akışı ve içerik playback çözümleri.',
    order: 1,
  },
  {
    _id: 'fallback-project-2',
    type: 'photo',
    title: 'Festival Görüntü Rejisi',
    category: 'Festival',
    description: 'Çoklu kamera ve medya server kurgusuyla büyük ölçekli festival prodüksiyon desteği.',
    order: 2,
  },
  {
    _id: 'fallback-project-3',
    type: 'video',
    title: 'Canlı Yayın Prodüksiyonu',
    category: 'Canlı Yayın',
    description: 'Etkinlik, lansman ve hibrit yayınlar için kesintisiz canlı yayın altyapısı.',
    order: 3,
  },
];
