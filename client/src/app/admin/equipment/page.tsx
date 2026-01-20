'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllEquipment, deleteEquipment, useDeleteEquipment } from '@/services/equipmentService';
import { bulkDelete, bulkUpdateStatus } from '@/services/bulkService';
import ExportMenu from '@/components/admin/ExportMenu';
import ImportModal from '@/components/admin/ImportModal';
import BulkActions, { BulkAction } from '@/components/admin/BulkActions';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';
import { Permission } from '@/config/permissions';
import { handleApiError, getUserFriendlyMessage } from '@/utils/apiErrorHandler';

// Ekipman türü tanımlama
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

// Backend'den gelen ekipman formatı
interface BackendEquipment {
  _id?: string;
  id?: string;
  name: string;
  model?: string;
  serialNumber?: string;
  type?: string;
  category?: string;
  status?: string;
  currentProject?: { name?: string } | string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  location?: string;
  notes?: string;
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

// Backend status enum'larını bu sayfadaki UI status tipine normalize et
const normalizeStatus = (rawStatus: any): Equipment['status'] => {
  if (!rawStatus) return 'Available';

  // Zaten UI formatındaysa
  if (rawStatus === 'Available' || rawStatus === 'InUse' || rawStatus === 'Maintenance' || rawStatus === 'Broken') {
    return rawStatus;
  }

  // Backend enum
  switch (String(rawStatus).toUpperCase()) {
    case 'AVAILABLE':
      return 'Available';
    case 'IN_USE':
      return 'InUse';
    case 'MAINTENANCE':
      return 'Maintenance';
    case 'DAMAGED':
      return 'Broken';
    default:
      return 'Available';
  }
};

// Örnek ekipman verileri
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
    name: 'Sony HDC-4300',
    model: 'HDC-4300',
    serialNumber: 'SHDC4300-2021-012',
    category: 'Camera',
    status: 'InUse',
    purchaseDate: '2021-03-10',
    lastMaintenanceDate: '2023-07-05',
    nextMaintenanceDate: '2024-01-05',
    currentProject: 'TRT Müzik Ödülleri',
    assignedTo: 'Mehmet Demir',
    location: 'Saha - Ankara',
    specs: {
      sensor: '3x 2/3" 4K CMOS',
      sensitivity: 'F12 at 2000 lx',
      SnR: '62dB',
      formats: '4K, HD, HDR',
      connections: '12G-SDI, SMPTE Fiber'
    },
    notes: 'Tripod ve uzaktan kontrol ünitesi ile birlikte gönderildi.'
  },
  {
    id: '5',
    name: 'Shure ULXD4Q',
    model: 'ULXD4Q Quad Digital Wireless Receiver',
    serialNumber: 'ULXD4Q-2022-078',
    category: 'Audio',
    status: 'Available',
    purchaseDate: '2022-01-25',
    lastMaintenanceDate: '2023-05-18',
    nextMaintenanceDate: '2024-05-18',
    location: 'Ana Depo',
    specs: {
      frequency: '470-636 MHz',
      channels: '4 kanallı',
      encryption: 'AES-256',
      networkControl: 'Ethernet/Dante',
      battery: '12 saat pil ömrü'
    }
  },
  {
    id: '6',
    name: 'Brompton Technology Tessera S8',
    model: 'Tessera S8 LED Processor',
    serialNumber: 'BTS8-2022-014',
    category: 'VideoSwitcher',
    status: 'Broken',
    purchaseDate: '2022-02-10',
    lastMaintenanceDate: '2023-06-30',
    location: 'Teknik Servis',
    specs: {
      outputs: '4K 60Hz',
      ports: '4 fiber/10 ethernet',
      processing: 'Dynamic calibration',
      inputs: 'HDMI 2.0, 12G-SDI'
    },
    notes: 'Güç kaynağı arızası. Yurtdışından yedek parça bekleniyor. Tahmini tamir süresi 3 hafta.'
  },
  {
    id: '7',
    name: 'Neutrik opticalCON QUAD',
    model: 'opticalCON QUAD Fiber Optic Cable',
    serialNumber: 'NOFCQ-150M-023',
    category: 'Cable',
    status: 'Available',
    purchaseDate: '2022-09-15',
    lastMaintenanceDate: '2023-08-05',
    nextMaintenanceDate: '2024-08-05',
    location: 'Ana Depo',
    specs: {
      length: '150 metre',
      type: '4-kanal fiber',
      connector: 'Neutrik opticalCON QUAD',
      jacket: 'Taktik zırhlı kılıf'
    }
  },
  {
    id: '8',
    name: 'ARRI SkyPanel S60-C',
    model: 'SkyPanel S60-C',
    serialNumber: 'ARSP60-2021-031',
    category: 'Lighting',
    status: 'InUse',
    purchaseDate: '2021-05-22',
    lastMaintenanceDate: '2023-04-12',
    nextMaintenanceDate: '2024-04-12',
    currentProject: 'BMW Tanıtım Çekimi',
    assignedTo: 'Ahmet Yılmaz',
    location: 'Saha - İstanbul',
    specs: {
      power: '450W',
      output: '56,000 lumens',
      colorTemp: '2,800K-10,000K',
      control: 'DMX512, Art-Net, sACN',
      dimming: '0-100% hassas'
    }
  }
];

// Kategori renkleri
const categoryColors: Record<string, string> = {
  VideoSwitcher: 'bg-blue-500 dark:bg-blue-600',
  MediaServer: 'bg-purple-500 dark:bg-purple-600',
  Monitor: 'bg-green-500 dark:bg-green-600',
  Cable: 'bg-gray-500 dark:bg-gray-600',
  AudioEquipment: 'bg-yellow-500 dark:bg-yellow-600',
  Other: 'bg-pink-500 dark:bg-pink-600',
};

// Kategori isimleri (Türkçe)
const categoryNames: Record<string, string> = {
  VideoSwitcher: 'Video Switcher',
  MediaServer: 'Media Server',
  Monitor: 'Monitör',
  Cable: 'Kablo',
  AudioEquipment: 'Ses Ekipmanı',
  Other: 'Diğer',
};

export default function EquipmentList() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [equipmentForMaintenance, setEquipmentForMaintenance] = useState<string | null>(null);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Ekipman verilerini yükleme fonksiyonu (yeniden kullanılabilir)
  const loadEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllEquipment();
      // Backend'den gelen response formatına göre düzenle
      const equipmentList = response.equipment || response;
      // Backend formatını frontend formatına dönüştür
      const formattedEquipment = Array.isArray(equipmentList) ? equipmentList.map((item: BackendEquipment) => ({
        id: item._id || item.id || '',
        name: item.name,
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        category: item.type || item.category || '',
        status: normalizeStatus(item.status),
        currentProject: typeof item.currentProject === 'object' && item.currentProject !== null && 'name' in item.currentProject 
          ? item.currentProject.name || '' 
          : typeof item.currentProject === 'string' 
            ? item.currentProject 
            : '',
        purchaseDate: item.purchaseDate,
        lastMaintenanceDate: item.lastMaintenanceDate,
        nextMaintenanceDate: item.nextMaintenanceDate,
        location: item.location || '',
        notes: item.notes || ''
      })) : [];
      setEquipment(formattedEquipment);
    } catch (err) {
      logger.error('Ekipman yükleme hatası:', err);
      setError('Ekipman verileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  // Ekipman verilerini yükleme
  useEffect(() => {
    loadEquipment();
  }, []);
  
  // Tarihi formatlama
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Bakım uyarısı kontrolü (eğer bakım tarihi 30 gün içindeyse uyarı göster)
  const maintenanceWarning = (nextMaintenanceDate?: string) => {
    if (!nextMaintenanceDate) return false;
    
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenanceDate);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 && diffDays <= 30;
  };
  
  // Filtreleme
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // React Query delete hook
  const deleteEquipmentMutation = useDeleteEquipment();

  // Ekipman silme işlevi
  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;
    try {
      await deleteEquipmentMutation.mutateAsync(equipmentToDelete);
      // React Query otomatik olarak cache'i invalidate edecek ve refetch yapacak
      // Local state'i de güncelle (optimistic update)
      setEquipment(prev => prev.filter(item => item.id !== equipmentToDelete));
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
      toast.success('Ekipman başarıyla silindi');
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      logger.error('Ekipman silme hatası:', apiError);
      setError(errorMessage);
      toast.error(errorMessage);
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
    }
  };
  
  // Bakım işlevi
  const handleSetMaintenance = async () => {
    if (!equipmentForMaintenance || !nextMaintenanceDate) return;
    
    try {
      // API entegrasyonu olduğunda burada backend'e istek gönderilecek
      // const response = await fetch(`/api/admin/equipment/${equipmentForMaintenance}/maintenance`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ nextMaintenanceDate }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Bakım tarihi güncellenirken bir hata oluştu');
      // }
      
      // Şimdilik örnek veriyi güncelliyoruz
      setEquipment(equipment.map(item => 
        item.id === equipmentForMaintenance 
          ? { ...item, nextMaintenanceDate: nextMaintenanceDate } 
          : item
      ));
      
      setShowMaintenanceModal(false);
      setEquipmentForMaintenance(null);
      setNextMaintenanceDate('');
      
    } catch (error) {
      logger.error('Bakım güncelleme hatası:', error);
    }
  };
  
  // Kategori adını görüntüleme
  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Toplu işlemler
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEquipment.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipment.map(item => item.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Lütfen silmek için en az bir ekipman seçin');
      return;
    }

    if (!confirm(`${selectedIds.length} ekipmanı silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const result = await bulkDelete({
        resource: 'equipment',
        ids: selectedIds,
      });
      toast.success(`${result.deletedCount || selectedIds.length} ekipman başarıyla silindi`);
      setSelectedIds([]);
      // Verileri yeniden yükle
      const response = await getAllEquipment();
      const equipmentList = response.equipment || response;
      const formattedEquipment = Array.isArray(equipmentList) ? equipmentList.map((item: BackendEquipment) => ({
        id: item._id || item.id || '',
        name: item.name,
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        category: item.type || item.category || '',
        status: normalizeStatus(item.status),
        currentProject: typeof item.currentProject === 'object' && item.currentProject !== null && 'name' in item.currentProject 
          ? item.currentProject.name || '' 
          : typeof item.currentProject === 'string' 
            ? item.currentProject 
            : '',
        purchaseDate: item.purchaseDate,
        lastMaintenanceDate: item.lastMaintenanceDate,
        nextMaintenanceDate: item.nextMaintenanceDate,
        location: item.location || '',
        notes: item.notes || ''
      })) : [];
      setEquipment(formattedEquipment);
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      const errorMessage = getUserFriendlyMessage(apiError);
      toast.error(errorMessage);
      logger.error('Toplu ekipman silme hatası:', apiError);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) {
      toast.error('Lütfen durumunu değiştirmek için en az bir ekipman seçin');
      return;
    }

    try {
      const result = await bulkUpdateStatus({
        resource: 'equipment',
        ids: selectedIds,
        status: newStatus,
      });
      toast.success(`${result.updatedCount || selectedIds.length} ekipmanın durumu güncellendi`);
      setSelectedIds([]);
      // Verileri yeniden yükle
      const response = await getAllEquipment();
      const equipmentList = response.equipment || response;
      const formattedEquipment = Array.isArray(equipmentList) ? equipmentList.map((item: BackendEquipment) => ({
        id: item._id || item.id || '',
        name: item.name,
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        category: item.type || item.category || '',
        status: normalizeStatus(item.status),
        currentProject: typeof item.currentProject === 'object' && item.currentProject !== null && 'name' in item.currentProject 
          ? item.currentProject.name || '' 
          : typeof item.currentProject === 'string' 
            ? item.currentProject 
            : '',
        purchaseDate: item.purchaseDate,
        lastMaintenanceDate: item.lastMaintenanceDate,
        nextMaintenanceDate: item.nextMaintenanceDate,
        location: item.location || '',
        notes: item.notes || ''
      })) : [];
      setEquipment(formattedEquipment);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Durum güncellenirken bir hata oluştu');
    }
  };

  const bulkActions: BulkAction[] = [
    {
      label: 'Kullanılabilir Yap',
      onClick: () => handleBulkStatusUpdate('Available'),
      variant: 'primary',
    },
    {
      label: 'Bakımda Yap',
      onClick: () => handleBulkStatusUpdate('Maintenance'),
      variant: 'secondary',
    },
    {
      label: 'Seçili Ekipmanları Sil',
      onClick: handleBulkDelete,
      variant: 'danger',
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve ekleme butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ekipman Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Teknik ekipmanları yönetin ve bakım takvimini planlayın</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white rounded-md shadow-sm transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import
          </button>
          <ExportMenu 
            baseEndpoint="/api/export/equipment"
            baseFilename="equipment"
            label="Dışa Aktar"
          />
          <Link href="/admin/equipment/add">
            <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Yeni Ekipman Ekle
            </button>
          </Link>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Arama */}
          <div>
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
                placeholder="İsim, model veya seri numarası ara..."
              />
            </div>
          </div>
          
          {/* Kategori filtresi */}
          <div>
            <label htmlFor="category-filter" className="sr-only">Kategori</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
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
              <option value="">Tüm Durumlar</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Toplu İşlemler */}
      {filteredEquipment.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          totalCount={filteredEquipment.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          actions={bulkActions}
        />
      )}

      {/* Ekipman Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Ekipman Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun ekipman bulunamadı.</p>
            {searchTerm || selectedCategory || selectedStatus ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedStatus('');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/equipment/add">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                  Yeni Ekipman Ekle
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ekipman
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seri No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bakım Tarihi
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEquipment.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                  <tr key={item.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-[#0066CC] dark:text-primary-light rounded focus:ring-2 focus:ring-[#0066CC] dark:focus:ring-primary-light cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                          <span className="text-[#0066CC] dark:text-primary-light text-base font-medium">
                            {item.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getCategoryLabel(item.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${statusColors[item.status]}`}>
                          {statusLabels[item.status]}
                        </span>
                        {item.status === 'InUse' && item.currentProject && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                            Proje: {item.currentProject}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {maintenanceWarning(item.nextMaintenanceDate) ? (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span className="text-yellow-600 dark:text-yellow-400">{formatDate(item.nextMaintenanceDate)}</span>
                          </div>
                        ) : (
                          formatDate(item.nextMaintenanceDate)
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Son: {formatDate(item.lastMaintenanceDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Link 
                          href={`/admin/equipment/view/${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80 cursor-pointer"
                        >
                          Görüntüle
                        </Link>
                        <PermissionLink
                          permission={Permission.EQUIPMENT_UPDATE}
                          href={`/admin/equipment/edit/${item.id}`}
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          disabledMessage="Ekipman düzenleme yetkiniz bulunmamaktadır"
                        >
                          Düzenle
                        </PermissionLink>
                        <PermissionButton
                          permission={Permission.MAINTENANCE_UPDATE}
                          onClick={() => {
                            setEquipmentForMaintenance(item.id);
                            setNextMaintenanceDate(item.nextMaintenanceDate || '');
                            setShowMaintenanceModal(true);
                          }}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                          disabledMessage="Bakım işlemi için yetkiniz bulunmamaktadır"
                        >
                          Bakım
                        </PermissionButton>
                        <PermissionButton
                          permission={Permission.EQUIPMENT_DELETE}
                          onClick={() => {
                            setEquipmentToDelete(item.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          disabledMessage="Ekipman silme yetkiniz bulunmamaktadır"
                        >
                          Sil
                        </PermissionButton>
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
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Ekipmanı Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu ekipmanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEquipmentToDelete(null);
                }}
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
      
      {/* Bakım modalı */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bakım Tarihini Güncelle</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ekipman için bir sonraki bakım tarihini seçin.
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="maintenance-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bakım Tarihi
              </label>
              <input
                type="date"
                id="maintenance-date"
                value={nextMaintenanceDate}
                onChange={(e) => setNextMaintenanceDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMaintenanceModal(false);
                  setEquipmentForMaintenance(null);
                  setNextMaintenanceDate('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleSetMaintenance}
                className="px-4 py-2 rounded-md text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary"
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