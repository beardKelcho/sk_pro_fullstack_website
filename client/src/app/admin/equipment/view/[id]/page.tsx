'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Ana interface
interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: 'VideoSwitcher' | 'MediaServer' | 'Camera' | 'Display' | 'Audio' | 'Lighting' | 'Cable' | 'Accessory';
  status: 'Available' | 'InUse' | 'Maintenance' | 'Broken';
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  currentProject?: string;
  assignedTo?: string;
  location: string;
  specs?: Record<string, string>;
  notes?: string;
  image?: string;
}

// Kategori tanımlamaları
const categories = [
  { value: 'VideoSwitcher', label: 'Video Switcher' },
  { value: 'MediaServer', label: 'Media Server' },
  { value: 'Camera', label: 'Kamera' },
  { value: 'Display', label: 'Ekran/Monitör' },
  { value: 'Audio', label: 'Ses Ekipmanı' },
  { value: 'Lighting', label: 'Işık Ekipmanı' },
  { value: 'Cable', label: 'Kablo' },
  { value: 'Accessory', label: 'Aksesuar' }
];

// Durum renkleri
const statusColors = {
  'Available': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'InUse': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Maintenance': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'Broken': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
};

// Durum etiketleri
const statusLabels = {
  'Available': 'Kullanılabilir',
  'InUse': 'Kullanımda',
  'Maintenance': 'Bakımda',
  'Broken': 'Arızalı'
};

// Örnek ekipman verisi - gerçek uygulamada API'den gelecek
const sampleEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Analog Way Aquilon RS4',
    model: 'Aquilon RS4',
    serialNumber: 'AWRS4-2023-001',
    category: 'VideoSwitcher',
    status: 'Available',
    purchaseDate: '2022-06-15',
    lastMaintenanceDate: '2023-08-10',
    nextMaintenanceDate: '2024-02-10',
    location: 'Ana Depo',
    specs: {
      inputs: '16x 4K60p',
      outputs: '8x 4K60p',
      layers: '16 mixable 4K layers',
      processor: 'Uncompressed 4K',
      memory: '250 still images'
    },
    notes: 'Premium video switcher, kullanım için teknik yönetici onayı gerekir.'
  },
  {
    id: '2',
    name: 'Dataton Watchpax 60',
    model: 'Watchpax 60',
    serialNumber: 'DWP60-2022-102',
    category: 'MediaServer',
    status: 'InUse',
    purchaseDate: '2022-03-20',
    lastMaintenanceDate: '2023-06-15',
    nextMaintenanceDate: '2023-12-15',
    currentProject: 'Vodafone Kurumsal Etkinlik',
    assignedTo: 'Zeynep Kaya',
    location: 'Saha - İstanbul',
    specs: {
      performance: '8K playback',
      outputs: '4x DisplayPort 1.2',
      inputs: '2x DisplayPort 1.2',
      storage: '2TB SSD RAID',
      network: '10GbE x2'
    },
    notes: 'Vodafone etkinliği için 12 Aralık\'a kadar rezerve edildi.'
  },
  // Diğer örnek veriler burada yer alacak
];

// Ana bileşen
export default function ViewEquipment() {
  const params = useParams();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [changeStatusModal, setChangeStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Equipment['status'] | ''>('');
  
  // ID parametresini al
  const equipmentId = params.id as string;
  
  // Ekipman verisini yükle
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        // Gerçek uygulamada API çağrısı yapılacak
        // const response = await fetch(`/api/admin/equipment/${equipmentId}`);
        // if (!response.ok) throw new Error('Ekipman verisi alınamadı');
        // const data = await response.json();
        
        // Şimdilik örnek veriyi kullan
        setTimeout(() => {
          const foundEquipment = sampleEquipment.find(item => item.id === equipmentId);
          if (foundEquipment) {
            setEquipment(foundEquipment);
            setLoading(false);
          } else {
            setError('Ekipman bulunamadı');
            setLoading(false);
          }
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Ekipman verisi yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };
    
    if (equipmentId) {
      fetchEquipment();
    }
  }, [equipmentId]);
  
  // Tarih formatlaması
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Kategori ismini bul
  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // Ekipman silme fonksiyonu
  const handleDeleteEquipment = async () => {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      // const response = await fetch(`/api/admin/equipment/${equipmentId}`, {
      //   method: 'DELETE',
      // });
      
      // if (!response.ok) {
      //   throw new Error('Ekipman silinemedi');
      // }
      
      // Başarılı silme sonrası liste sayfasına yönlendir
      router.push('/admin/equipment');
      
    } catch (error) {
      console.error('Silme hatası:', error);
      // Hata mesajı gösterilebilir
    }
  };
  
  // Durum değiştirme fonksiyonu
  const handleChangeStatus = async () => {
    if (!equipment || !newStatus) return;
    
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      // const response = await fetch(`/api/admin/equipment/${equipmentId}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Durum güncellenemedi');
      // }
      
      // Başarılı güncelleme sonrası durumu güncelle
      setEquipment({
        ...equipment,
        status: newStatus as Equipment['status']
      });
      
      setChangeStatusModal(false);
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      // Hata mesajı gösterilebilir
    }
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[60vh]">
        <svg className="animate-spin h-12 w-12 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  // Ekipman bulunamadı durumu
  if (error || !equipment) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Ekipman Bulunamadı</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{error || 'Belirtilen ID ile eşleşen ekipman bulunamadı.'}</p>
        <div className="mt-6">
          <Link href="/admin/equipment">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
              Ekipman Listesine Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Durum bilgisi için sınıf ve simgeler
  const statusInfo = {
    Available: { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-800 dark:text-green-400',
      icon: 'M5 13l4 4L19 7'
    },
    InUse: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-800 dark:text-blue-400',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    Maintenance: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
      text: 'text-yellow-800 dark:text-yellow-400',
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
    },
    Broken: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-800 dark:text-red-400',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    }
  }[equipment.status];
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - Başlık ve Aksiyon Butonları */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <Link href="/admin/equipment" className="inline-flex items-center text-[#0066CC] dark:text-primary-light hover:underline mb-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Tüm Ekipmanlar
              </Link>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{equipment.name}</h1>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-300">
                <span className="mr-2">{getCategoryLabel(equipment.category)}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[equipment.status]}`}>
                  {statusLabels[equipment.status]}
                </span>
              </div>
            </div>
            <div className="flex mt-4 md:mt-0 space-x-3">
              <button
                onClick={() => setChangeStatusModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
                Durum Değiştir
              </button>
              <Link href={`/admin/equipment/edit/${equipment.id}`}>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Düzenle
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Sil
              </button>
            </div>
          </div>
        </div>
        
        {/* Sekmeler */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="px-4 -mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Detaylar
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'specs'
                  ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Teknik Özellikler
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Bakım Bilgileri
            </button>
          </nav>
        </div>
      </div>
      
      {/* İçerik Bölümü */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-6">
          {/* Detaylar Sekmesi */}
          {activeTab === 'details' && (
            <div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Temel Bilgiler */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
                  
                  <div className="space-y-6">
                    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <dl>
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">{equipment.model}</dd>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 px-4 py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Seri Numarası</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">{equipment.serialNumber}</dd>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">{getCategoryLabel(equipment.category)}</dd>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 px-4 py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Durum</dt>
                          <dd className="text-sm col-span-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[equipment.status]}`}>
                              {statusLabels[equipment.status]}
                            </span>
                          </dd>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Konum</dt>
                          <dd className="text-sm text-gray-900 dark:text-white col-span-2">{equipment.location}</dd>
                        </div>
                        
                        {equipment.currentProject && (
                          <div className="bg-white dark:bg-gray-800 px-4 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mevcut Proje</dt>
                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{equipment.currentProject}</dd>
                          </div>
                        )}
                        
                        {equipment.assignedTo && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Atanan Kişi</dt>
                            <dd className="text-sm text-gray-900 dark:text-white col-span-2">{equipment.assignedTo}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {equipment.notes && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Notlar</h4>
                        <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{equipment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tarih Bilgileri */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tarih Bilgileri</h3>
                  
                  <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <dl>
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Alım Tarihi</dt>
                        <dd className="text-sm text-gray-900 dark:text-white col-span-2">{formatDate(equipment.purchaseDate)}</dd>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 px-4 py-4 grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Bakım</dt>
                        <dd className="text-sm text-gray-900 dark:text-white col-span-2">{formatDate(equipment.lastMaintenanceDate)}</dd>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sonraki Bakım</dt>
                        <dd className="text-sm text-gray-900 dark:text-white col-span-2">
                          {formatDate(equipment.nextMaintenanceDate)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Teknik Özellikler Sekmesi */}
          {activeTab === 'specs' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Teknik Özellikler</h3>
              
              {equipment.specs && Object.keys(equipment.specs).length > 0 ? (
                <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Özellik
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Değer
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {Object.entries(equipment.specs).map(([key, value], index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {key}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Bu ekipman için teknik özellik bilgisi bulunmuyor.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Bakım Bilgileri Sekmesi */}
          {activeTab === 'maintenance' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bakım Bilgileri</h3>
                
                <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <dl>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Bakım Tarihi</dt>
                      <dd className="text-sm text-gray-900 dark:text-white col-span-2">{formatDate(equipment.lastMaintenanceDate)}</dd>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 px-4 py-4 grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sonraki Bakım Tarihi</dt>
                      <dd className="text-sm text-gray-900 dark:text-white col-span-2">{formatDate(equipment.nextMaintenanceDate)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bakım Geçmişi</h3>
                
                <button
                  onClick={() => router.push(`/admin/equipment/${equipment.id}/maintenance/add`)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Bakım Kaydı Ekle
                </button>
              </div>
              
              {/* Bakım geçmişi burada yer alacak - API entegrasyonu ile getirilecek */}
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Henüz bakım kaydı bulunmuyor.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Ekipmanı Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {equipment.name} adlı ekipmanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteEquipment}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Durum Değiştirme Modalı */}
      {changeStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Durum Değiştir</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {equipment.name} için yeni durumu seçin.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Yeni Durum
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Equipment['status'])}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
              >
                <option value="">Seçiniz</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setChangeStatusModal(false);
                  setNewStatus('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={!newStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  newStatus
                    ? 'bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary'
                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                }`}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 