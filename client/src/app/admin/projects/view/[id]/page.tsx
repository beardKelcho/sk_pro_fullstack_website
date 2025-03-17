'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Proje durumları
type ProjectStatus = 'Planlama' | 'Devam Ediyor' | 'Tamamlandı' | 'Ertelendi' | 'İptal Edildi';

// Müşteri tipi
interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

// Proje tipi
interface Project {
  id: string;
  name: string;
  description: string;
  customer: Customer;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget?: number;
  location: string;
  team: TeamMember[];
  equipment: Equipment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: TimelineItem[];
}

// Takım üyesi tipi
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

// Ekipman tipi
interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
}

// Zaman çizelgesi öğesi tipi
interface TimelineItem {
  title: string;
  date: string;
  description: string;
}

// Durum renkleri
const statusColors: Record<ProjectStatus, string> = {
  'Planlama': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Devam Ediyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Tamamlandı': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Ertelendi': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  'İptal Edildi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

// Örnek proje verileri (gerçek uygulamada API'den gelecek)
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Vodafone Kurumsal Etkinlik',
    description: 'Vodafone kurumsal müşteriler için büyük çaplı sunum ve tanıtım etkinliği',
    customer: {
      id: '101',
      name: 'Ahmet Yılmaz',
      companyName: 'Vodafone Türkiye',
      email: 'ahmet.yilmaz@vodafone.com',
      phone: '+90 532 123 4567'
    },
    startDate: '2023-12-10',
    endDate: '2023-12-12',
    status: 'Devam Ediyor',
    budget: 250000,
    location: 'Lütfi Kırdar Kongre Merkezi, İstanbul',
    team: ['1', '3', '5', '8'],
    equipment: ['1', '2', '4', '7'],
    notes: 'Ekstra LED ekranlar için hazırlık yapılacak. Yedek medya server götürülecek.',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-11-20T09:15:00Z'
  },
  {
    id: '2',
    name: 'TEB Yıl Sonu Değerlendirme',
    description: 'TEB yıl sonu değerlendirme ve 2024 hedefler toplantısı',
    customer: {
      id: '102',
      name: 'Zeynep Kaya',
      companyName: 'Türk Ekonomi Bankası',
      email: 'zeynep.kaya@teb.com',
      phone: '+90 533 765 4321'
    },
    startDate: '2023-12-20',
    endDate: '2023-12-20',
    status: 'Planlama',
    budget: 150000,
    location: 'TEB Genel Müdürlük, İstanbul',
    team: ['2', '4', '6'],
    equipment: ['3', '5', '8'],
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-15T16:45:00Z'
  },
  {
    id: '3',
    name: 'Mercedes-Benz Yeni Model Lansmanı',
    description: 'Yeni elektrikli SUV model lansmanı ve basın etkinliği',
    customer: {
      id: '103',
      name: 'Murat Öztürk',
      companyName: 'Mercedes-Benz Türkiye',
      email: 'murat.ozturk@mercedes-benz.com',
      phone: '+90 535 876 5432'
    },
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    status: 'Tamamlandı',
    budget: 350000,
    location: 'Tersane İstanbul',
    team: ['1', '2', '7', '9'],
    equipment: ['1', '2', '3', '6'],
    notes: 'Müşteri tüm ekipmanlardan çok memnun kaldı. Gelecek etkinlikleri de konuşmak istiyorlar.',
    createdAt: '2023-09-05T11:20:00Z',
    updatedAt: '2023-11-13T14:30:00Z'
  },
  {
    id: '4',
    name: 'Turkcell Teknoloji Zirvesi',
    description: '5G teknolojileri ve dijital dönüşüm zirvesi',
    customer: {
      id: '104',
      name: 'Elif Demir',
      companyName: 'Turkcell',
      email: 'elif.demir@turkcell.com',
      phone: '+90 536 987 6543'
    },
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    status: 'Planlama',
    budget: 400000,
    location: 'Haliç Kongre Merkezi, İstanbul',
    team: ['3', '5', '8', '10'],
    equipment: ['1', '4', '9', '10'],
    notes: 'Teknik gereksinimler şubat başında belirlenecek. Müşteri AR deneyimi talep edebilir.',
    createdAt: '2023-10-25T09:45:00Z',
    updatedAt: '2023-11-05T13:10:00Z'
  },
  {
    id: '5',
    name: 'Koç Holding İnovasyon Günleri',
    description: 'Koç Holding şirketleri için inovasyon ve dijital dönüşüm etkinliği',
    customer: {
      id: '105',
      name: 'Mehmet Koç',
      companyName: 'Koç Holding',
      email: 'mehmet.koc@koc.com.tr',
      phone: '+90 537 234 5678'
    },
    startDate: '2023-09-05',
    endDate: '2023-09-08',
    status: 'Tamamlandı',
    budget: 500000,
    location: 'Koç Müzesi, İstanbul',
    team: ['1', '4', '7', '11'],
    equipment: ['2', '5', '7', '8'],
    notes: 'Çok başarılı geçti. Şubat 2024 için yeni etkinlik görüşülecek.',
    createdAt: '2023-06-15T08:30:00Z',
    updatedAt: '2023-09-10T16:20:00Z'
  }
];

// Örnek takım üyeleri (gerçek uygulamada API'den gelecek)
const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Teknik Direktör', email: 'ahmet.yilmaz@skpro.com', phone: '+90 532 111 1111' },
  { id: '2', name: 'Mehmet Öz', role: 'Video Mühendisi', email: 'mehmet.oz@skpro.com', phone: '+90 533 222 2222' },
  { id: '3', name: 'Ayşe Demir', role: 'Grafik Tasarımcı', email: 'ayse.demir@skpro.com', phone: '+90 534 333 3333' },
  { id: '4', name: 'Selin Yıldız', role: 'Proje Koordinatörü', email: 'selin.yildiz@skpro.com', phone: '+90 535 444 4444' },
  { id: '5', name: 'Burak Aydın', role: 'Ses Mühendisi', email: 'burak.aydin@skpro.com', phone: '+90 536 555 5555' },
  { id: '6', name: 'Zeynep Kaya', role: 'Işık Şefi', email: 'zeynep.kaya@skpro.com', phone: '+90 537 666 6666' },
  { id: '7', name: 'Mustafa Çelik', role: 'LED Operatörü', email: 'mustafa.celik@skpro.com', phone: '+90 538 777 7777' },
  { id: '8', name: 'Özge Yılmaz', role: 'Prodüksiyon Asistanı', email: 'ozge.yilmaz@skpro.com', phone: '+90 539 888 8888' },
  { id: '9', name: 'Mert Demir', role: 'Teknik Destek', email: 'mert.demir@skpro.com', phone: '+90 540 999 9999' },
  { id: '10', name: 'Elif Şahin', role: 'Medya Server Operatörü', email: 'elif.sahin@skpro.com', phone: '+90 541 000 0000' },
  { id: '11', name: 'Kemal Kara', role: 'Kameraman', email: 'kemal.kara@skpro.com', phone: '+90 542 111 0000' }
];

// Örnek ekipmanlar (gerçek uygulamada API'den gelecek)
const sampleEquipments: Equipment[] = [
  { id: '1', name: 'Analog Way Aquilon RS4', model: 'Aquilon RS4', serialNumber: 'AW-123456', category: 'Video Switcher' },
  { id: '2', name: 'Dataton Watchpax 60', model: 'Watchpax 60', serialNumber: 'DT-789012', category: 'Media Server' },
  { id: '3', name: 'Blackmagic ATEM 4 M/E', model: 'ATEM 4 M/E Constellation HD', serialNumber: 'BM-345678', category: 'Video Switcher' },
  { id: '4', name: 'Barco UDX-4K32', model: 'UDX-4K32', serialNumber: 'BC-901234', category: 'Projeksiyon' },
  { id: '5', name: 'Sony PVM-X2400', model: 'PVM-X2400', serialNumber: 'SN-567890', category: 'Monitör' },
  { id: '6', name: 'Dell Precision 7920', model: 'Precision 7920', serialNumber: 'DL-123789', category: 'Workstation' },
  { id: '7', name: 'DiGiCo S31', model: 'S31', serialNumber: 'DG-456123', category: 'Ses Mikseri' },
  { id: '8', name: 'GrandMA3 Light', model: 'MA3 Light', serialNumber: 'GM-789456', category: 'Işık Konsolu' },
  { id: '9', name: 'Shure ULXD4', model: 'ULXD4', serialNumber: 'SH-012345', category: 'Kablosuz Mikrofon' },
  { id: '10', name: 'ROE Visual CB5', model: 'Carbon CB5', serialNumber: 'ROE-678901', category: 'LED Panel' }
];

// Örnek zaman çizelgesi (gerçek uygulamada API'den gelecek)
const sampleTimelineItems: Record<string, TimelineItem[]> = {
  '1': [
    {
      title: 'Proje Başlangıcı',
      date: '2023-10-25',
      description: 'Vodafone ile ilk toplantı yapıldı ve projenin ana hatları belirlendi.'
    },
    {
      title: 'Teknik Keşif',
      date: '2023-11-05',
      description: 'Lütfi Kırdar Kongre Merkezi\'nde teknik ekiple keşif yapıldı.'
    },
    {
      title: 'Ekipman Listesi Onayı',
      date: '2023-11-15',
      description: 'Müşteri ekipman listesini ve teknik planı onayladı.'
    },
    {
      title: 'Kurulum Başlangıcı',
      date: '2023-12-08',
      description: 'Etkinlik alanında teknik kurulum başladı.'
    },
    {
      title: 'Teknik Prova',
      date: '2023-12-09',
      description: 'Tüm sistemlerin test edilmesi ve provalar yapıldı.'
    },
    {
      title: 'Etkinlik Sonu',
      date: '2023-12-12',
      description: 'Etkinlik başarıyla tamamlandı ve toplanma işlemleri yapıldı.'
    }
  ],
  '2': [
    {
      title: 'Proje Başlangıcı',
      date: '2023-11-01',
      description: 'TEB ile ilk görüşme yapıldı.'
    },
    {
      title: 'Bütçe Onayı',
      date: '2023-11-15',
      description: 'Proje bütçesi onaylandı ve sözleşme imzalandı.'
    },
    {
      title: 'İçerik Toplantısı',
      date: '2023-12-05',
      description: 'Müşteri ile içerik ve sunum detayları görüşüldü.'
    },
    {
      title: 'Teknik Hazırlık',
      date: '2023-12-15',
      description: 'Ekipman hazırlıkları ve kontroller tamamlandı.'
    }
  ],
  '3': [
    {
      title: 'Proje Başlangıcı',
      date: '2023-09-05',
      description: 'Mercedes-Benz ile ilk toplantı yapıldı.'
    },
    {
      title: 'Mekan Keşfi',
      date: '2023-09-20',
      description: 'Tersane İstanbul\'da keşif yapıldı.'
    },
    {
      title: 'Tasarım Onayı',
      date: '2023-10-10',
      description: 'Sahne ve teknik tasarımlar onaylandı.'
    },
    {
      title: 'Kurulum Başlangıcı',
      date: '2023-11-08',
      description: 'Etkinlik alanında kurulum başladı.'
    },
    {
      title: 'Etkinlik Sonu',
      date: '2023-11-12',
      description: 'Lansman etkinliği başarıyla tamamlandı.'
    }
  ],
  '4': [
    {
      title: 'Proje Başlangıcı',
      date: '2023-10-25',
      description: 'Turkcell ile ilk toplantı yapıldı.'
    },
    {
      title: 'Konsept Onayı',
      date: '2023-11-15',
      description: 'Etkinlik konsepti ve teknik gereksinimler onaylandı.'
    },
    {
      title: 'İçerik Toplantısı',
      date: '2023-12-20',
      description: 'Müşteri ile içerik akışı görüşmeleri yapıldı.'
    }
  ],
  '5': [
    {
      title: 'Proje Başlangıcı',
      date: '2023-06-15',
      description: 'Koç Holding ile ilk toplantı yapıldı.'
    },
    {
      title: 'Mekan Keşfi',
      date: '2023-07-10',
      description: 'Koç Müzesi\'nde keşif yapıldı.'
    },
    {
      title: 'Teknik Plan Onayı',
      date: '2023-08-05',
      description: 'Teknik planlar ve ekipman listesi onaylandı.'
    },
    {
      title: 'Kurulum Başlangıcı',
      date: '2023-09-03',
      description: 'Etkinlik alanında kurulum başladı.'
    },
    {
      title: 'Etkinlik Sonu',
      date: '2023-09-08',
      description: 'Etkinlik başarıyla tamamlandı.'
    }
  ]
};

// Para formatı için yardımcı fonksiyon
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
};

// Tarih formatı için yardımcı fonksiyon
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Proje ilerleme yüzdesini hesaplama fonksiyonu
const calculateProgress = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  
  // Proje henüz başlamadıysa
  if (now < start) return 0;
  
  // Proje tamamlandıysa
  if (now > end) return 100;
  
  // Proje devam ediyorsa
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
};

// Örnek proje verisi
const sampleProject: Project = {
  id: '1',
  name: 'Teknoloji Zirvesi 2023',
  description: 'Teknoloji Zirvesi 2023, Türkiye\'nin en büyük teknoloji etkinliklerinden biridir. Bu etkinlikte SK Production olarak tüm görüntü rejisi ve medya server hizmetlerini sağlıyoruz.\n\nEtkinlik 3 gün sürecek ve 5 farklı sahne kurulumu gerçekleştirilecektir. Ana sahne için Analog Way Aquilon RS4 ve yardımcı sahneler için Analog Way Pulse 4K kullanılacaktır.',
  customer: {
    id: '101',
    companyName: 'TechEvents A.Ş.',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@techevents.com',
    phone: '+90 532 123 45 67'
  },
  startDate: '2023-11-15',
  endDate: '2023-11-18',
  status: 'Devam Ediyor',
  budget: 750000,
  location: 'İstanbul Kongre Merkezi, Harbiye',
  team: [
    {
      id: '201',
      name: 'Mehmet Kaya',
      role: 'Görüntü Yönetmeni',
      email: 'm.kaya@skproduction.com',
      phone: '+90 533 765 43 21'
    },
    {
      id: '202',
      name: 'Zeynep Demir',
      role: 'Media Server Operatörü',
      email: 'z.demir@skproduction.com',
      phone: '+90 535 987 65 43'
    },
    {
      id: '203',
      name: 'Ali Yıldız',
      role: 'Teknik Direktör',
      email: 'a.yildiz@skproduction.com',
      phone: '+90 536 234 56 78'
    },
    {
      id: '204',
      name: 'Ayşe Şahin',
      role: 'Işık Tasarımcısı',
      email: 'a.sahin@skproduction.com',
      phone: '+90 537 345 67 89'
    }
  ],
  equipment: [
    {
      id: '301',
      name: 'Analog Way Aquilon RS4',
      model: 'RS4',
      serialNumber: 'AW2023456',
      category: 'VideoSwitcher'
    },
    {
      id: '302',
      name: 'Analog Way Pulse 4K',
      model: 'Pulse 4K',
      serialNumber: 'AW2023789',
      category: 'VideoSwitcher'
    },
    {
      id: '303',
      name: 'Dataton Watchpax 60',
      model: 'Watchpax 60',
      serialNumber: 'DT789012',
      category: 'MediaServer'
    },
    {
      id: '304',
      name: 'Barco UDX-4K32',
      model: 'UDX-4K32',
      serialNumber: 'BC456789',
      category: 'Projeksiyon'
    },
    {
      id: '305',
      name: 'Samsung LED Wall',
      model: 'The Wall',
      serialNumber: 'SM123456',
      category: 'LED'
    }
  ],
  timeline: [
    {
      title: 'Proje Başlangıcı',
      date: '2023-11-01',
      description: 'Proje planlaması ve ekip oluşturma aşaması.'
    },
    {
      title: 'Teknik Keşif',
      date: '2023-11-05',
      description: 'Mekan keşfi ve teknik gereksinimlerin belirlenmesi.'
    },
    {
      title: 'Ekipman Hazırlığı',
      date: '2023-11-10',
      description: 'Tüm ekipmanların test edilmesi ve nakliye hazırlığı.'
    },
    {
      title: 'Kurulum Başlangıcı',
      date: '2023-11-13',
      description: 'Mekanda kurulum çalışmalarının başlaması.'
    },
    {
      title: 'Teknik Provalar',
      date: '2023-11-14',
      description: 'Tüm sistemlerin test edilmesi ve provalar.'
    },
    {
      title: 'Etkinlik - Gün 1',
      date: '2023-11-15',
      description: 'Etkinliğin ilk günü.'
    },
    {
      title: 'Etkinlik - Gün 2',
      date: '2023-11-16',
      description: 'Etkinliğin ikinci günü.'
    },
    {
      title: 'Etkinlik - Gün 3',
      date: '2023-11-17',
      description: 'Etkinliğin son günü.'
    },
    {
      title: 'Toplanma ve Nakliye',
      date: '2023-11-18',
      description: 'Ekipmanların toplanması ve depoya nakli.'
    },
    {
      title: 'Proje Değerlendirmesi',
      date: '2023-11-20',
      description: 'Ekip ile proje değerlendirme toplantısı.'
    }
  ],
  notes: 'Müşteri, tüm sahnelerde 4K çözünürlük istiyor. Ana sahnede özel LED duvar tasarımı için ekstra hazırlık gerekecek. VIP konuşmacılar için ayrı teknik brief hazırlanacak.',
  createdAt: '2023-10-01T10:30:00Z',
  updatedAt: '2023-11-01T14:15:00Z'
};

export default function ViewProject() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Ekip üyesi bilgilerini getir
  const getTeamMember = (id: string) => {
    return project?.team.find(member => member.id === id);
  };
  
  // Ekipman bilgilerini getir
  const getEquipment = (id: string) => {
    return project?.equipment.find(equipment => equipment.id === id);
  };
  
  // Projenin zaman çizelgesini getir
  const getTimeline = () => {
    return project?.timeline || [];
  };
  
  // Projeyi yükle
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // API isteği simülasyonu
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gerçek bir API yerine örnek veriyi kullanıyoruz
        setProject(sampleProject);
        setLoading(false);
      } catch (err) {
        console.error('Proje yüklenirken hata oluştu:', err);
        setError('Proje yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Proje bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Hata</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{error}</p>
          <div className="mt-6">
            <Link href="/admin/projects">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Proje Listesine Dön
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Proje bulunamadı durumu
  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Proje Bulunamadı</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">İstediğiniz proje bulunamadı veya erişim izniniz yok.</p>
          <div className="mt-6">
            <Link href="/admin/projects">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Proje Listesine Dön
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Üst bölüm - başlık ve eylem butonları */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/projects" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{project.name}</h1>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300 flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
              {project.status}
            </span>
            <span className="mx-2">•</span>
            <span>{project.customer.companyName}</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href={`/admin/projects/edit/${project.id}`}>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Düzenle
            </button>
          </Link>
          <Link href="/admin/projects">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Proje Listesi
            </button>
          </Link>
        </div>
      </div>
      
      {/* Sekme (Tab) menüsü */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'team'
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Ekip ve Ekipman
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'timeline'
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Zaman Çizelgesi
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-1 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'notes'
                ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Notlar
          </button>
        </nav>
      </div>
      
      {/* İçerik alanı - Burada sekmelerin içeriği gösterilecek */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Genel Bilgiler sekmesi */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Temel Bilgiler Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Müşteri</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      <div>{project.customer.companyName}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                        {project.customer.name} • {project.customer.email}
                      </div>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Başlangıç Tarihi</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(project.startDate)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bitiş Tarihi</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(project.endDate)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Lokasyon</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{project.location}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bütçe</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(project.budget || 0)}</dd>
                  </div>
                </dl>
              </div>

              {/* Proje Açıklaması Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proje Açıklaması</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {project.description || 'Bu proje için açıklama bulunmuyor.'}
                </p>
                {project.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Notlar</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {project.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Proje Özeti Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proje Özeti</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ekip Üyeleri</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{project.team.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ekipman Sayısı</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{project.equipment.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Proje Süresi</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1)} gün
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bütçe</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{formatCurrency(project.budget || 0)}</p>
                  </div>
                </div>
                
                {/* Son Güncelleme Bilgisi */}
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-right">
                  <p>
                    Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                    {' | '}
                    Son Güncelleme: {new Date(project.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ekip Üyeleri Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ekip Üyeleri</h3>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Toplam: {project.team.length} kişi
                  </span>
                </div>
                
                {project.team.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {project.team.map((teamMember, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white">
                              {teamMember.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {teamMember.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {teamMember.role}
                            </p>
                          </div>
                          <div className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-500">
                            <a href={`tel:${teamMember.phone}`} className="mr-3 hover:text-blue-800 dark:hover:text-blue-400">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                              </svg>
                            </a>
                            <a href={`mailto:${teamMember.email}`} className="hover:text-blue-800 dark:hover:text-blue-400">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu projeye henüz ekip üyesi atanmamış.</p>
                  </div>
                )}
              </div>
              
              {/* Ekipman Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Kullanılan Ekipmanlar</h3>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Toplam: {project.equipment.length} ekipman
                  </span>
                </div>
                
                {project.equipment.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {project.equipment.map((equipment, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white">
                              {equipment.category.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {equipment.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {equipment.model} • SN: {equipment.serialNumber}
                            </p>
                          </div>
                          <div className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-500">
                            <Link href={`/admin/equipment/view/${equipment.id}`} className="hover:text-blue-800 dark:hover:text-blue-400">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu projede henüz ekipman kullanılmıyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Proje Zaman Çizelgesi</h3>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </span>
              </div>
              
              {/* Zaman çizelgesi görselleştirmesi */}
              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-800 dark:text-blue-200">
                      İlerleme
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                      {calculateProgress(project.startDate, project.endDate)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div style={{ width: `${calculateProgress(project.startDate, project.endDate)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-600">
                  </div>
                </div>
              </div>
              
              {/* Aşamalar */}
              <div className="py-4">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Proje Aşamaları</h4>
                
                {project.timeline && project.timeline.length > 0 ? (
                  <ol className="relative border-l border-gray-200 dark:border-gray-700">                  
                    {project.timeline.map((phase, index) => {
                      // Bugünün tarihini al
                      const today = new Date();
                      // Aşamanın tamamlanma durumunu belirle
                      const isCompleted = new Date(phase.date) < today;
                      // Bugün işlenen aşama mı
                      const isToday = new Date(phase.date).toDateString() === today.toDateString();
                      
                      return (
                        <li key={index} className="mb-10 ml-6">
                          <span className={`flex absolute -left-3 justify-center items-center w-6 h-6 rounded-full ring-8 ring-white dark:ring-gray-900 
                            ${isCompleted ? 'bg-green-500 dark:bg-green-600' : (isToday ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600')}`}>
                            {isCompleted ? (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                              </svg>
                            )}
                          </span>
                          <h3 className={`flex items-center mb-1 text-lg font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {phase.title}
                            {isToday && <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3">Bugün</span>}
                          </h3>
                          <time className="block mb-2 text-sm font-normal leading-none text-gray-500 dark:text-gray-400">
                            {formatDate(phase.date)}
                          </time>
                          <p className="mb-4 text-base font-normal text-gray-600 dark:text-gray-400">
                            {phase.description}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu proje için henüz zaman çizelgesi oluşturulmamış.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Notlar Kartı */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 overflow-hidden">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proje Notları</h3>
                {project.notes ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {project.notes}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bu proje için henüz not eklenmemiş.</p>
                  </div>
                )}
              </div>
              
              {/* Not Ekleme Formu */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Not Ekle</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Yeni Not
                    </label>
                    <textarea
                      id="note"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Proje hakkında not ekleyin..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                      Not Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 