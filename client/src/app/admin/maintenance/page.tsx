'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ExportButton from '@/components/admin/ExportButton';
import { useRouter } from 'next/navigation';
import { getAllMaintenance, deleteMaintenance, getStatusLabel, getTypeLabel, getPriorityLabel } from '@/services/maintenanceService';
import type { Maintenance } from '@/services/maintenanceService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

// Renk ayarları
const statusColors = {
  'Planlandı': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Devam Ediyor': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'Tamamlandı': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'İptal Edildi': 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-400'
};

const priorityColors = {
  'Düşük': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Orta': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'Yüksek': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  'Acil': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
};

const typeColors = {
  'Periyodik': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'Arıza': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  'Kalibrasyon': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Güncelleme': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
};

export default function MaintenanceList() {
  const router = useRouter();
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Tümü');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tümü');
  const [selectedPriority, setSelectedPriority] = useState<string>('Tümü');
  
  // Modal state'leri
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bakım verilerini getir
  useEffect(() => {
    const fetchMaintenance = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllMaintenance();
        setMaintenance(data.maintenances || []);
      } catch (err) {
        setError('Bakım kayıtları alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Filtreleme
  const filteredMaintenance = maintenance.filter(item => {
    const itemAny = item as any;
    const equipmentName = typeof item.equipment === 'object' && item.equipment 
      ? (item.equipment as any).name || itemAny.equipmentName || ''
      : itemAny.equipmentName || '';
    const matchesSearch = 
      equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'Tümü' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'Tümü' || item.status === selectedStatus;
    const matchesPriority = selectedPriority === 'Tümü' || (itemAny.priority && itemAny.priority === selectedPriority);
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });
  
  // Bakım kaydı silme
  const handleDeleteMaintenance = async () => {
    if (!maintenanceToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMaintenance(maintenanceToDelete);
      setMaintenance(prevMaintenance => prevMaintenance.filter(m => m.id !== maintenanceToDelete));
      setShowDeleteModal(false);
      setMaintenanceToDelete(null);
      toast.success('Bakım kaydı başarıyla silindi');
    } catch (error: any) {
      logger.error('Bakım kaydı silme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Bakım kaydı silinirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve ekleme butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bakım Takibi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Ekipman bakımlarını planlayın ve takip edin</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            endpoint="/export/maintenance"
            filename="maintenance-export.csv"
            label="Dışa Aktar"
          />
          <Link href="/admin/maintenance/add">
            <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Yeni Bakım Ekle
            </button>
          </Link>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Arama */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="sr-only">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full pl-10 p-2.5"
                placeholder="Ekipman adı veya açıklama ara..."
              />
            </div>
          </div>
          
          {/* Bakım Tipi filtresi */}
          <div>
            <label htmlFor="type-filter" className="sr-only">Bakım Tipi</label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Tipler</option>
              <option value="Periyodik">Periyodik Bakım</option>
              <option value="Arıza">Arıza Bakımı</option>
              <option value="Kalibrasyon">Kalibrasyon</option>
              <option value="Güncelleme">Güncelleme</option>
            </select>
          </div>
          
          {/* Durum filtresi */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Durum</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Planlandı">Planlandı</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>
          
          {/* Öncelik filtresi */}
          <div>
            <label htmlFor="priority-filter" className="sr-only">Öncelik</label>
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Öncelikler</option>
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Acil">Acil</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Bakım Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredMaintenance.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Bakım Kaydı Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun bakım kaydı bulunamadı.</p>
            {searchTerm || selectedType !== 'Tümü' || selectedStatus !== 'Tümü' || selectedPriority !== 'Tümü' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('Tümü');
                  setSelectedStatus('Tümü');
                  setSelectedPriority('Tümü');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/maintenance/add">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                  Yeni Bakım Ekle
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ekipman
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tip & Öncelik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarihler
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atanan Kişi
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMaintenance.map(item => {
                  const itemAny = item as any;
                  const equipmentName = typeof item.equipment === 'object' && item.equipment 
                    ? (item.equipment as any).name || itemAny.equipmentName || ''
                    : itemAny.equipmentName || '';
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{equipmentName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[getTypeLabel(item.type) as keyof typeof typeColors] || ''}`}>
                            {getTypeLabel(item.type)}
                          </span>
                          {itemAny.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[getPriorityLabel(itemAny.priority) as keyof typeof priorityColors] || ''}`}>
                              {getPriorityLabel(itemAny.priority)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[getStatusLabel(item.status) as keyof typeof statusColors] || ''}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Başlangıç: {formatDate(item.scheduledDate || itemAny.startDate || '')}
                        </div>
                        {(item.completedDate || itemAny.endDate) && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Bitiş: {formatDate(item.completedDate || itemAny.endDate || '')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {itemAny.assignedToName || item.assignedTo || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/maintenance/view/${item.id || item._id}`}>
                            <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                              Görüntüle
                            </button>
                          </Link>
                          <Link href={`/admin/maintenance/edit/${item.id || item._id}`}>
                            <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                              Düzenle
                            </button>
                          </Link>
                          <button 
                            onClick={() => {
                              setMaintenanceToDelete(item.id || item._id || null);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Silme onay modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Bakım Kaydını Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu bakım kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMaintenanceToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteMaintenance}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 