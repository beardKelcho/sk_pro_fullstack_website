import type { Project } from '@/components/home/Projects';
import { SiteContent } from '@/types/cms';

export const fallbackContent: SiteContent = {
  hero: {
    title: 'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi',
    subtitle: 'Profesyonel Görüntü ve Medya Çözümleri',
    description: 'SK Production olarak etkinliklerinize profesyonel görüntü rejisi ve medya server çözümleri sunuyoruz.',
    buttonText: 'Projelerimiz',
    buttonLink: '#projects',
    rotatingTexts: [
      'Görsel mükemmellikte uzman ekip',
      'Etkinliklerinizde profesyonel çözümler',
      'Medya server ve görüntü rejisi çözümleri'
    ]
  },
  about: {
    title: 'SK Production Hakkında',
    description: 'SK Production, profesyonel etkinlikler için görüntü rejisi ve medya server çözümleri sunan uzman bir ekiptir.\n\nAnalog Way Aquilon, Dataton Watchpax ve Resolume Arena 7 gibi son teknoloji ekipmanlarla hizmet veriyoruz.',
    imageUrl: '/images/sk-logo.png',
    stats: [
      { label: 'Tamamlanan Proje', value: '250+', icon: 'check-circle' },
      { label: 'Yıllık Deneyim', value: '12+', icon: 'calendar' },
      { label: 'Profesyonel Ekipman', value: '50+', icon: 'monitor' }
    ]
  },
  services: {
    title: 'Hizmetlerimiz & Ekipmanlarımız',
    subtitle: 'Etkinlikleriniz için profesyonel çözümler ve son teknoloji ekipmanlar',
    services: [
      { title: 'Görüntü Rejisi', description: 'Profesyonel ekipmanlarımız ve uzman ekibimizle etkinlikleriniz için kusursuz görüntü rejisi hizmeti sağlıyoruz.', icon: 'video' },
      { title: 'Medya Server Sistemleri', description: 'Yüksek performanslı medya server sistemlerimiz ile etkinliklerinizde kesintisiz ve yüksek kaliteli içerik yayını.', icon: 'screen' },
      { title: 'LED Ekran Yönetimi', description: 'Farklı boyut ve çözünürlüklerdeki LED ekranlar için içerik hazırlama ve profesyonel yönetim hizmetleri.', icon: 'led' }
    ]
  },
  contact: {
    address: 'Zincirlidere Caddesi No:52/C Şişli/İstanbul',
    phone: '+90 532 123 4567',
    email: 'info@skpro.com.tr',
    workingHours: ['Pazartesi - Cuma: 09:00 - 18:00', 'Cumartesi: 10:00 - 14:00', 'Pazar: Kapalı']
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
