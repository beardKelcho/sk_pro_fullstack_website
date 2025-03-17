'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Ekipman türü
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
  specs: Record<string, string>;
  notes?: string;
  image?: string;
}

// Örnek ekipman verisi (gerçek uygulamada API'den gelecek)
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
  {
    id: '3',
    name: 'Barco UDX-4K32',
    model: 'UDX-4K32',
    serialNumber: 'BUDX32-2022-005',
    category: 'Display',
    status: 'Maintenance',
    purchaseDate: '2021-11-05',
    lastMaintenanceDate: '2023-09-20',
    nextMaintenanceDate: '2024-03-20',
    location: 'Servis',
    specs: {
      brightness: '31,000 ANSI lumens',
      resolution: '3840 x 2400 (4K UHD)',
      contrast: '2000:1',
      processing: 'HDR technology',
      weight: '92kg'
    },
    notes: 'Lamba değişimi ve genel bakım için serviste. 5 Aralık\'ta teslim alınacak.'
  },
  {
    id: '4',
    name: 'Sony HDC-4800',
    model: 'HDC-4800',
    serialNumber: 'SHDC-2021-087',
    category: 'Camera',
    status: 'Available',
    purchaseDate: '2021-05-18',
    lastMaintenanceDate: '2023-07-12',
    nextMaintenanceDate: '2023-11-30',
    location: 'Ana Depo',
    specs: {
      sensor: '4K Super 35mm CMOS',
      sensitivity: 'F10 at 1080/59.94p',
      frameRate: 'Up to 8x HD super slow motion',
      outputs: 'IP, 12G-SDI',
      interface: 'SMPTE Fiber'
    },
    notes: 'Yüksek hızlı çekimler için öncelikli ekipman.'
  }
];

// Bakım durumu için bir utilities
const getDateDifference = (date: string): number => {
  const today = new Date();
  const maintenanceDate = new Date(date);
  const diffTime = maintenanceDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getMaintenanceStatus = (nextMaintenanceDate?: string): 'urgent' | 'warning' | 'upcoming' | 'normal' => {
  if (!nextMaintenanceDate) return 'normal';
  
  const daysUntil = getDateDifference(nextMaintenanceDate);
  
  if (daysUntil < 0) return 'urgent';
  if (daysUntil <= 7) return 'warning';
  if (daysUntil <= 30) return 'upcoming';
  return 'normal';
};

// Formatlanmış tarih string
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function MaintenancePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [newMaintenanceDate, setNewMaintenanceDate] = useState<string>('');
  const [updatingMaintenance, setUpdatingMaintenance] = useState<boolean>(false);
  
  // Ekipman verilerini yükle
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // API entegrasyonu burada yapılacak
        // const response = await fetch('/api/admin/equipment');
        // const data = await response.json();
        
        // Şimdilik örnek veriyi kullan
        await new Promise(resolve => setTimeout(resolve, 800));
        setEquipment(sampleEquipment);
        setLoading(false);
      } catch (error) {
        console.error('Ekipman verileri yüklenirken hata:', error);
        setLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);
  
  // Filtrelenmiş ekipman listesi
  const filteredEquipment = equipment.filter(item => {
    // Kategori filtresi
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }
    
    // Bakım durumu filtresi
    if (maintenanceStatusFilter) {
      const status = getMaintenanceStatus(item.nextMaintenanceDate);
      if (status !== maintenanceStatusFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  // Bakım durumuna göre sıralanmış liste
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (!a.nextMaintenanceDate) return 1;
    if (!b.nextMaintenanceDate) return -1;
    
    const dateA = new Date(a.nextMaintenanceDate);
    const dateB = new Date(b.nextMaintenanceDate);
    
    return dateA.getTime() - dateB.getTime();
  });
  
  // Bakım tamamlandı işlemini yap
  const handleCompleteMaintenance = (item: Equipment) => {
    setSelectedEquipment(item);
    
    // Varsayılan olarak 6 ay sonrası
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setMonth(today.getMonth() + 6);
    
    setNewMaintenanceDate(nextDate.toISOString().split('T')[0]);
    setShowModal(true);
  };
  
  // Bakım tarihini güncelle
  const updateMaintenanceDate = async () => {
    if (!selectedEquipment || !newMaintenanceDate) return;
    
    setUpdatingMaintenance(true);
    
    try {
      // API entegrasyonu burada yapılacak
      // const response = await fetch(`/api/admin/equipment/${selectedEquipment.id}/maintenance`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     lastMaintenanceDate: new Date().toISOString().split('T')[0],
      //     nextMaintenanceDate: newMaintenanceDate,
      //   }),
      // });
      
      // API entegrasyonu olmadığı için yerel veriyi güncelle
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const today = new Date().toISOString().split('T')[0];
      
      setEquipment(prevEquipment => 
        prevEquipment.map(eq => 
          eq.id === selectedEquipment.id 
            ? { 
                ...eq, 
                lastMaintenanceDate: today,
                nextMaintenanceDate: newMaintenanceDate,
                status: 'Available' as const 
              } 
            : eq
        )
      );
      
      setUpdatingMaintenance(false);
      setShowModal(false);
      
    } catch (error) {
      console.error('Bakım güncellenirken hata:', error);
      setUpdatingMaintenance(false);
    }
  };
  
  // Bakım durumuna göre renklendirme
  const getStatusColor = (status: 'urgent' | 'warning' | 'upcoming' | 'normal'): string => {
    switch (status) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'normal':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    }
  };
  
  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bakım Takibi</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ekipman bakım tarihlerini takip edin ve planlayın
          </p>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori Filtrele
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Tüm Kategoriler</option>
              <option value="VideoSwitcher">Video Switcher</option>
              <option value="MediaServer">Media Server</option>
              <option value="Camera">Kamera</option>
              <option value="Display">Ekran/Monitör</option>
              <option value="Audio">Ses Ekipmanı</option>
              <option value="Lighting">Işık Ekipmanı</option>
              <option value="Cable">Kablo</option>
              <option value="Accessory">Aksesuar</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="maintenanceStatusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bakım Durumu
            </label>
            <select
              id="maintenanceStatusFilter"
              value={maintenanceStatusFilter}
              onChange={(e) => setMaintenanceStatusFilter(e.target.value)}
              className="block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Tüm Durumlar</option>
              <option value="urgent">Acil Bakım Gerekli</option>
              <option value="warning">Bu Hafta Bakım Gerekli</option>
              <option value="upcoming">Bu Ay Bakım Gerekli</option>
              <option value="normal">Bakım Planı Normal</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Yükleniyor */}
      {loading && (
        <div className="flex justify-center items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Yükleniyor...</span>
        </div>
      )}
      
      {/* Bakım Takip Tablosu */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ekipman
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Son Bakım
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sonraki Bakım
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Bakım kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  sortedEquipment.map(item => {
                    const maintenanceStatus = getMaintenanceStatus(item.nextMaintenanceDate);
                    const statusColor = getStatusColor(maintenanceStatus);
                    const daysDiff = item.nextMaintenanceDate ? getDateDifference(item.nextMaintenanceDate) : null;
                    
                    let statusText = '';
                    if (daysDiff !== null) {
                      if (daysDiff < 0) {
                        statusText = `${Math.abs(daysDiff)} gün gecikti`;
                      } else if (daysDiff === 0) {
                        statusText = 'Bugün';
                      } else {
                        statusText = `${daysDiff} gün sonra`;
                      }
                    }
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.model} ({item.serialNumber})
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(item.lastMaintenanceDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatDate(item.nextMaintenanceDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => handleCompleteMaintenance(item)}
                            >
                              Bakım Tamamlandı
                            </button>
                            <Link href={`/admin/equipment/view/${item.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              Görüntüle
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Bakım Tamamlama Modal */}
      {showModal && selectedEquipment && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div 
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Bakım Tamamlandı
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedEquipment.name} ekipmanının bakımı tamamlandı olarak işaretlenecek. Lütfen bir sonraki bakım tarihini belirleyin.
                      </p>
                      
                      <div className="mt-4">
                        <label htmlFor="newMaintenanceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sonraki Bakım Tarihi
                        </label>
                        <input
                          type="date"
                          id="newMaintenanceDate"
                          name="newMaintenanceDate"
                          value={newMaintenanceDate}
                          onChange={(e) => setNewMaintenanceDate(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={updatingMaintenance}
                  onClick={updateMaintenanceDate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {updatingMaintenance ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={updatingMaintenance}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 