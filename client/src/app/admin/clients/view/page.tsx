'use client';
import { Suspense } from 'react';

import logger from '@/utils/logger';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectStatus } from '@/types/project';

// Müşteri ve Proje türleri
interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  projectCount: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  status: 'Planlanıyor' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi';
  startDate: string;
  endDate: string;
  budget: number;
  location: string;
}

// Renk kodları
const statusColors: Record<ProjectStatus, string> = {
  'PLANNING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', // legacy
  'PENDING_APPROVAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'APPROVED': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'ACTIVE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'ON_HOLD': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', // Sarı - Ertelendi
  'COMPLETED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', // Yeşil - Tamamlandı
  'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' // Kırmızı - İptal Edildi
};

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  'PLANNING': 'Onay Bekleyen', // legacy
  'PENDING_APPROVAL': 'Onay Bekleyen',
  'APPROVED': 'Onaylanan',
  'ACTIVE': 'Devam Ediyor',
  'ON_HOLD': 'Ertelendi',
  'COMPLETED': 'Tamamlandı',
  'CANCELLED': 'İptal Edildi'
};

// Örnek müşteri verileri
const sampleClients: Client[] = [
  {
    id: '1',
    name: 'TechCon Group',
    contactPerson: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@techcongroup.com',
    phone: '+90 532 123 45 67',
    address: 'Maslak Mah. Büyükdere Cad. No:123, İstanbul',
    industry: 'Etkinlik Organizasyonu',
    projectCount: 5,
    status: 'Active',
    createdAt: '2022-08-15',
    notes: 'Teknoloji sektöründeki en büyük müşterilerimizden. Yıllık olarak 3-4 büyük etkinlik yapıyorlar.'
  },
  {
    id: '2',
    name: 'X Teknoloji A.Ş.',
    contactPerson: 'Zeynep Öztürk',
    email: 'zeynep.ozturk@xteknoloji.com',
    phone: '+90 533 234 56 78',
    address: 'Kozyatağı Mah. Bağdat Cad. No:45, İstanbul',
    industry: 'Kurumsal',
    projectCount: 3,
    status: 'Active',
    createdAt: '2022-10-20',
    notes: 'Ürün tanıtımlarını genellikle canlı yayın olarak da paylaşıyorlar.'
  },
  {
    id: '3',
    name: 'Y İletişim',
    contactPerson: 'Mehmet Kaya',
    email: 'mehmet.kaya@yiletisim.com',
    phone: '+90 532 345 67 89',
    address: 'Beşiktaş Mah. Cevdetpaşa Cad. No:67, İstanbul',
    industry: 'Televizyon',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-01-05'
  },
  {
    id: '4',
    name: 'Z Organizasyon',
    contactPerson: 'Ayşe Demir',
    email: 'ayse.demir@zorganizasyon.com',
    phone: '+90 535 456 78 90',
    address: 'Bağcılar Mah. Merkez Cad. No:89, İstanbul',
    industry: 'Konser & Sahne',
    projectCount: 7,
    status: 'Active',
    createdAt: '2022-05-12',
    notes: 'Büyük konser organizasyonları yapıyorlar.'
  },
  {
    id: '5',
    name: 'Mega Holding',
    contactPerson: 'Ali Yıldız',
    email: 'ali.yildiz@megaholding.com',
    phone: '+90 534 567 89 01',
    address: 'Şişli Mah. Abide-i Hürriyet Cad. No:34, İstanbul',
    industry: 'Kurumsal',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-02-18'
  },
  {
    id: '6',
    name: 'Eğitim Kurumu',
    contactPerson: 'Selin Şahin',
    email: 'selin.sahin@egitimkurumu.edu.tr',
    phone: '+90 536 678 90 12',
    address: 'Kadıköy Mah. Bağdat Cad. No:23, İstanbul',
    industry: 'Eğitim',
    projectCount: 1,
    status: 'Inactive',
    createdAt: '2022-11-30'
  },
  {
    id: '7',
    name: 'Modern Müze',
    contactPerson: 'Burak Avcı',
    email: 'burak.avci@modernmuze.com',
    phone: '+90 537 789 01 23',
    address: 'Beyoğlu Mah. İstiklal Cad. No:56, İstanbul',
    industry: 'Müze & Sergi',
    projectCount: 2,
    status: 'Active',
    createdAt: '2023-03-10'
  }
];

// Örnek proje verileri
const sampleProjects: Project[] = [
  { 
    id: '1', 
    name: 'TechCon 2023 Lansman Etkinliği', 
    clientId: '1', 
    status: 'Tamamlandı', 
    startDate: '2023-03-15', 
    endDate: '2023-03-16', 
    budget: 250000, 
    location: 'Hilton Convention Center, İstanbul' 
  },
  { 
    id: '2', 
    name: 'TechCon Bayi Toplantısı', 
    clientId: '1', 
    status: 'Planlanıyor', 
    startDate: '2023-07-10', 
    endDate: '2023-07-11', 
    budget: 175000, 
    location: 'Wyndham Grand, İzmir' 
  },
  { 
    id: '3', 
    name: 'X Teknoloji Ürün Tanıtımı', 
    clientId: '2', 
    status: 'Devam Ediyor', 
    startDate: '2023-05-20', 
    endDate: '2023-05-20', 
    budget: 120000, 
    location: 'X Teknoloji Genel Merkezi, İstanbul' 
  },
  { 
    id: '4', 
    name: 'Y İletişim Çekimleri', 
    clientId: '3', 
    status: 'Tamamlandı', 
    startDate: '2023-02-05', 
    endDate: '2023-02-07', 
    budget: 85000, 
    location: 'Y İletişim Stüdyoları, İstanbul' 
  },
  { 
    id: '5', 
    name: 'Festival Organizasyonu', 
    clientId: '4', 
    status: 'Devam Ediyor', 
    startDate: '2023-06-15', 
    endDate: '2023-06-18', 
    budget: 500000, 
    location: 'KüçükÇiftlik Park, İstanbul' 
  }
];

function ViewClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = (searchParams.get('id') as string);
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'projects' | 'notes'>('info');
  
  // Veri yükleme
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        const { getCustomerById } = await import('@/services/customerService');
        const { projectApi } = await import('@/services/api/project');
        
        // Müşteri bilgilerini çek
        const clientData = await getCustomerById(clientId);
        
        // Backend formatını frontend formatına dönüştür
        const formattedClient = {
          id: clientData._id || clientData.id || '',
          name: clientData.name,
          contactPerson: clientData.name,
          email: clientData.email || '',
          phone: clientData.phone || '',
          address: clientData.address || '',
          industry: 'Diğer',
          projectCount: 0,
          status: 'Active' as 'Active' | 'Inactive',
          createdAt: clientData.createdAt || new Date().toISOString(),
          notes: clientData.notes || ''
        };
        
        setClient(formattedClient);
        
        // Müşterinin projelerini çek
        try {
          const projectsResponse = await projectApi.getAll();
          const projectsList = projectsResponse.data.projects || projectsResponse.data;
          const clientProjectsList = Array.isArray(projectsList) ? projectsList
            .filter((p: any) => {
              const pClientId = typeof p.client === 'string' ? p.client : p.client?._id || p.client?.id;
              return pClientId === clientId;
            })
            .map((p: any) => ({
              id: p._id || p.id || '',
              name: p.name || '',
              clientId: typeof p.client === 'string' ? p.client : p.client?._id || p.client?.id || '',
              status: (p.status === 'PLANNING' ? 'Planlanıyor' :
                      p.status === 'ACTIVE' ? 'Devam Ediyor' :
                      p.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi') as 'Planlanıyor' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi',
              startDate: p.startDate || '',
              endDate: p.endDate || '',
              budget: p.budget || 0,
              location: p.location || ''
            })) : [];
          setClientProjects(clientProjectsList);
        } catch (err) {
          logger.error('Projeler yüklenirken hata:', err);
          setClientProjects([]);
        }
        
        setLoading(false);
      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Para birimini formatlama
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  // Müşteri bulunamadı gösterimi
  if (!loading && !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Müşteri Bulunamadı</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          Aradığınız müşteri bulunamadı. Müşteri silinmiş olabilir veya geçersiz bir ID belirtmiş olabilirsiniz.
        </p>
        <button 
          onClick={() => router.push('/admin/clients')}
          className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors"
        >
          Müşteri Listesine Dön
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Üst bölüm - Müşteri adı ve durum */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <div className="h-14 w-14 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-[#0066CC] dark:text-primary-light text-xl font-semibold">
                    {client?.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{client?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Müşteri ID: {client?.id} • Oluşturulma: {formatDate(client?.createdAt || '')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  client?.status === 'Active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {client?.status === 'Active' ? 'Aktif' : 'Pasif'}
                </span>
                
                <Link href={`/admin/clients/edit?id=${client?.id}`}>
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Düzenle
                  </button>
                </Link>
                
                <button 
                  onClick={() => router.push('/admin/clients')}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Listeye Dön
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab menüsü */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 mb-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-4 text-center rounded-md transition-colors ${
                  activeTab === 'info'
                    ? 'bg-[#0066CC]/10 dark:bg-primary-light/10 text-[#0066CC] dark:text-primary-light font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                Müşteri Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-3 px-4 text-center rounded-md transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-[#0066CC]/10 dark:bg-primary-light/10 text-[#0066CC] dark:text-primary-light font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                Projeler ({clientProjects.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 px-4 text-center rounded-md transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-[#0066CC]/10 dark:bg-primary-light/10 text-[#0066CC] dark:text-primary-light font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                }`}
              >
                Notlar
              </button>
            </div>
          </div>
          
          {/* Müşteri Bilgileri Tab İçeriği */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol kolon - Temel Bilgiler */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">İletişim Bilgileri</h2>
                
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">İletişim Kişisi</span>
                    <span className="text-gray-800 dark:text-white font-medium mt-1">{client?.contactPerson}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">E-posta</span>
                    <span className="text-gray-800 dark:text-white font-medium mt-1">{client?.email}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Telefon</span>
                    <span className="text-gray-800 dark:text-white font-medium mt-1">{client?.phone}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Adres</span>
                    <span className="text-gray-800 dark:text-white font-medium mt-1">{client?.address}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Endüstri</span>
                    <span className="text-gray-800 dark:text-white font-medium mt-1">{client?.industry}</span>
                  </div>
                </div>
              </div>
              
              {/* Sağ kolon - Özet Bilgiler */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Özet Bilgiler</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Proje</p>
                      <p className="text-2xl font-bold text-[#0066CC] dark:text-primary-light">{client?.projectCount}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aktif Projeler</p>
                      <p className="text-2xl font-bold text-[#0066CC] dark:text-primary-light">
                        {clientProjects.filter(p => p.status === 'Devam Ediyor' || p.status === 'Planlanıyor').length}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tamamlanan Projeler</p>
                      <p className="text-2xl font-bold text-[#0066CC] dark:text-primary-light">
                        {clientProjects.filter(p => p.status === 'Tamamlandı').length}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">İptal Edilen Projeler</p>
                      <p className="text-2xl font-bold text-[#0066CC] dark:text-primary-light">
                        {clientProjects.filter(p => p.status === 'İptal Edildi').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Müşteri Durumu</h2>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Müşteri İlişkisi</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client?.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                    }`}>
                      {client?.status === 'Active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <Link href={`/admin/clients/edit?id=${client?.id}`}>
                      <button className="w-full px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors">
                        Müşteriyi Düzenle
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Projeler Tab İçeriği */}
          {activeTab === 'projects' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Müşteri Projeleri</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {client?.name} ile ilişkili tüm projeler ({clientProjects.length})
                    </p>
                  </div>
                  <Link href="/admin/projects/add">
                    <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Yeni Proje Ekle
                    </button>
                  </Link>
                </div>
              </div>
              
              {clientProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Proje Bulunamadı</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu müşteri ile ilişkili herhangi bir proje bulunmamaktadır.</p>
                  <Link href="/admin/projects/add">
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                      Yeni Proje Ekle
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Proje Adı
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Durum
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Tarihler
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Bütçe
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {clientProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{project.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'Planlanıyor'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                : project.status === 'Devam Ediyor'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                                : project.status === 'Tamamlandı'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(project.startDate)} - {formatDate(project.endDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {formatCurrency(project.budget)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/admin/projects/view?id=${project.id}`}>
                                <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                                  Görüntüle
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Notlar Tab İçeriği */}
          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Müşteri Notları</h2>
              
              {client?.notes ? (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{client.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Not Bulunmuyor</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bu müşteri için henüz not eklenmemiş.</p>
                  <Link href={`/admin/clients/edit?id=${client?.id}`}>
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                      Not Ekle
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 
export default function ViewClient() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] dark:border-primary"></div>
      </div>
    }>
      <ViewClientContent />
    </Suspense>
  );
}
