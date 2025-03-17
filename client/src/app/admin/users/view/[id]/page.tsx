'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

// Kullanıcı türü tanımlama
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Proje Yöneticisi' | 'Teknik Direktör' | 'Teknisyen' | 'Medya Server Uzmanı' | 'Görüntü Yönetmeni';
  department?: string;
  status: 'Aktif' | 'Pasif';
  avatar?: string;
  phone?: string;
  lastActive?: string;
  joinDate?: string;
  projects?: string[];
  bio?: string;
  skills?: string[];
  address?: string;
  emergencyContact?: string;
}

// Örnek rol renkleri
const roleColors = {
  'Admin': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'Proje Yöneticisi': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Teknik Direktör': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'Teknisyen': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  'Medya Server Uzmanı': 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400',
  'Görüntü Yönetmeni': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400'
};

// Örnek kullanıcı verileri
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@skproduction.com',
    role: 'Teknik Direktör',
    department: 'Teknik',
    status: 'Aktif',
    avatar: 'AY',
    phone: '+90 555 123 4567',
    lastActive: '2023-12-25T14:30:00',
    joinDate: '2020-05-15T09:00:00',
    projects: ['Turkcell Dijital Konser', 'İstanbul Film Festivali'],
    bio: 'Teknik ekibin lideri olarak, etkinliklerimizin teknik altyapısını yönetmekteyim. 10 yıllık sektör deneyimim var.',
    skills: ['Video Switching', 'Işık Tasarımı', 'Teknik Yönetim', 'Ekip Koordinasyonu'],
    address: 'Kadıköy, İstanbul',
    emergencyContact: 'Ayşe Yılmaz (Eş) - +90 555 987 6543'
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    email: 'zeynep@skproduction.com',
    role: 'Medya Server Uzmanı',
    department: 'Medya',
    status: 'Aktif',
    avatar: 'ZK',
    phone: '+90 555 234 5678',
    lastActive: '2023-12-26T09:15:00',
    joinDate: '2021-03-10T10:30:00',
    projects: ['Vodafone Kurumsal Lansman', 'Mercedes Yeni Model Tanıtımı'],
    bio: 'Medya server sistemleri konusunda 7 yıllık deneyime sahibim. Watchout ve Disguise sistemlerinde uzmanlığım var.',
    skills: ['Disguise', 'Watchout', 'Resolume Arena', 'Content Management'],
    address: 'Beşiktaş, İstanbul'
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    email: 'mehmet@skproduction.com',
    role: 'Görüntü Yönetmeni',
    department: 'Görüntü',
    status: 'Aktif',
    avatar: 'MD',
    phone: '+90 555 345 6789',
    lastActive: '2023-12-25T16:45:00',
    joinDate: '2019-11-22T08:15:00',
    projects: ['TED Konferansı', 'Ulusal Müzik Ödülleri'],
    bio: 'Görüntü yönetmeni olarak çeşitli büyük ölçekli etkinliklerde görev aldım. Kamera ekibi koordinasyonu ve görüntü rejisi konularında deneyimliyim.',
    skills: ['Görüntü Rejisi', 'Kamera Yönetimi', 'Görüntü Mikseri', 'IMAG'],
    address: 'Şişli, İstanbul'
  },
  {
    id: '4',
    name: 'Ayşe Şahin',
    email: 'ayse@skproduction.com',
    role: 'Teknisyen',
    department: 'Teknik',
    status: 'Aktif',
    avatar: 'AŞ',
    phone: '+90 555 456 7890',
    lastActive: '2023-12-26T11:20:00',
    joinDate: '2022-01-15T14:00:00',
    projects: ['Teknoloji Zirvesi', 'Gaming Istanbul'],
    bio: 'Teknik kurulum ve sorun giderme konusunda 5 yıllık deneyime sahibim. LED ekran kurulumu ve video sistemleri konusunda uzmanım.',
    skills: ['LED Kurulum', 'Video Sistemleri', 'Teknik Destek', 'Kablolama'],
    address: 'Ataşehir, İstanbul'
  },
  {
    id: '5',
    name: 'Can Özkan',
    email: 'can@skproduction.com',
    role: 'Proje Yöneticisi',
    department: 'Yönetim',
    status: 'Aktif',
    avatar: 'CÖ',
    phone: '+90 555 567 8901',
    lastActive: '2023-12-26T10:30:00',
    joinDate: '2020-09-05T09:30:00',
    projects: ['Ulusal Müzik Ödülleri', 'Kurumsal İnovasyon Günleri', 'E-Spor Şampiyonası'],
    bio: 'Proje yönetimi konusunda 8 yıllık deneyimim var. Büyük ölçekli etkinlikler için planlama, koordinasyon ve müşteri ilişkileri konularında uzmanım.',
    skills: ['Proje Yönetimi', 'Bütçe Planlama', 'Ekip Koordinasyonu', 'Müşteri İlişkileri'],
    address: 'Levent, İstanbul',
    emergencyContact: 'Deniz Özkan (Kardeş) - +90 555 222 3344'
  },
  {
    id: '6',
    name: 'Elif Yıldız',
    email: 'elif@skproduction.com',
    role: 'Admin',
    department: 'Yönetim',
    status: 'Aktif',
    avatar: 'EY',
    phone: '+90 555 678 9012',
    lastActive: '2023-12-26T13:45:00',
    joinDate: '2018-06-12T11:15:00',
    projects: ['Tüm Projeler'],
    bio: 'Şirket yönetimi ve operasyonlarından sorumlu olarak görev yapmaktayım. Finansal planlama, insan kaynakları ve şirket stratejisi konularında 12 yıllık deneyimim bulunmaktadır.',
    skills: ['Şirket Yönetimi', 'Finansal Planlama', 'İnsan Kaynakları', 'Operasyon Yönetimi', 'Stratejik Planlama'],
    address: 'Etiler, İstanbul',
    emergencyContact: 'Ahmet Yıldız (Eş) - +90 555 111 2233'
  },
  {
    id: '7',
    name: 'Burak Aydın',
    email: 'burak@skproduction.com',
    role: 'Teknisyen',
    department: 'Teknik',
    status: 'Pasif',
    avatar: 'BA',
    phone: '+90 555 789 0123',
    lastActive: '2023-12-20T15:10:00',
    joinDate: '2021-11-08T10:00:00',
    projects: ['Mobil Dünya Kongresi', 'Yılsonu Kurumsal Etkinliği'],
    bio: 'Ses ve ışık sistemleri konusunda 6 yıllık deneyime sahibim. Teknik kurulum ve operasyon süreçlerinde uzmanım.',
    skills: ['Ses Sistemleri', 'Işık Sistemleri', 'Sahne Kurulumu'],
    address: 'Maltepe, İstanbul'
  }
];

// Tarih formatlama fonksiyonu
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Belirtilmemiş';
  
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
};

// Kullanıcı görüntüleme bileşeni
export default function ViewUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'projects' | 'activity'>('profile');
  
  // Kullanıcı verilerini yükleme
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const response = await fetch(`/api/admin/users/${userId}`);
        // if (!response.ok) throw new Error('Kullanıcı verileri alınamadı');
        // const data = await response.json();
        // setUser(data);
        
        // Şimdilik örnek veriyi kullanıyoruz
        setTimeout(() => {
          const foundUser = sampleUsers.find(u => u.id === userId);
          setUser(foundUser || null);
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : !user ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Kullanıcı Bulunamadı</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu ID'ye sahip bir kullanıcı bulunamadı.</p>
          <div className="mt-6">
            <Link href="/admin/users">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                Kullanıcı Listesine Dön
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Başlık ve Eylemler */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                <span className="text-[#0066CC] dark:text-primary-light text-2xl font-medium">
                  {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{user.department}</span>
                  <span className={`ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                    user.status === 'Aktif'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users">
                <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Kullanıcı Listesine Dön
                </button>
              </Link>
              <Link href={`/admin/users/edit/${user.id}`}>
                <button className="px-3 py-1.5 bg-[#0066CC] dark:bg-primary-light text-white rounded-md text-sm hover:bg-[#0055AA] dark:hover:bg-primary transition-colors">
                  Düzenle
                </button>
              </Link>
            </div>
          </div>

          {/* Sekme Gezinme */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveSection('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'profile'
                    ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveSection('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'projects'
                    ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Projeler
              </button>
              <button
                onClick={() => setActiveSection('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === 'activity'
                    ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Aktivite
              </button>
            </nav>
          </div>

          {/* Sekme İçerikleri */}
          <div className="mt-6">
            {activeSection === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sol Kolon - Temel Bilgiler */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ad Soyad</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">E-posta</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefon</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.phone || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Adres</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.address || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Katılma Tarihi</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(user.joinDate)}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Aktivite</h3>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(user.lastActive)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Hakkında</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{user.bio}</p>
                    </div>
                  )}
                  
                  {user.emergencyContact && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Acil Durum İletişim</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.emergencyContact}</p>
                    </div>
                  )}
                </div>
                
                {/* Sağ Kolon - Rol ve Yetenekler */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rol Bilgileri</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol</h3>
                        <div className="mt-1">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${roleColors[user.role]}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Departman</h3>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.department || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</h3>
                        <div className="mt-1">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                            user.status === 'Aktif'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {user.skills && user.skills.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Yetenekler</h2>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'projects' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Katıldığı Projeler</h2>
                  {user.projects && user.projects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {user.projects.map((project, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-full bg-[#0066CC] dark:bg-primary-light mr-2"></div>
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">{project}</h3>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {/* Gerçek entegrasyonda burada proje detayları gösterilecek */}
                            Bu projenin detayları sadece örnek amaçlıdır. Gerçek API entegrasyonunda bu bilgiler proje veritabanından çekilecektir.
                          </p>
                          <div className="mt-4 flex justify-end">
                            <Link href={`/admin/projects/view/1`}>
                              <button className="text-sm text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                                Detayları Görüntüle
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Proje Bulunamadı</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu kullanıcı henüz hiçbir projeye atanmamış.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeSection === 'activity' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Son Aktiviteler</h2>
                  
                  {/* Aktivite zaman çizelgesi */}
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {/* Örnek aktiviteler - gerçek uygulamada API'den alınır */}
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-[#0066CC]/10 dark:bg-primary-light/10 flex items-center justify-center">
                                <svg className="h-5 w-5 text-[#0066CC] dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-white">Sisteme Giriş Yaptı</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(user.lastActive)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-white">Profili Güncellendi</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                  2 gün önce
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-white">Projeye Atandı</span>
                                  <span> - </span>
                                  <span className="font-medium text-[#0066CC] dark:text-primary-light">Turkcell Dijital Konser</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                  1 hafta önce
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-white">Kayıt Oldu</span>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                  {formatDate(user.joinDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not: Bu aktiviteler örnek amaçlıdır. Gerçek uygulamada sistem aktiviteleri otomatik olarak kaydedilecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 