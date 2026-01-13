'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { updateEquipment } from '@/services/equipmentService';

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
  specs: Record<string, string>;
  notes?: string;
  image?: string;
}

// Form için kullanılacak interface
interface EquipmentFormData {
  name: string;
  model: string;
  serialNumber: string;
  category: Equipment['category'] | '';
  status: Equipment['status'] | '';
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  currentProject: string;
  assignedTo: string;
  location: string;
  specs: Array<{ key: string; value: string }>;
  notes: string;
}

// Hata mesajları için interface
interface FormErrors {
  name?: string;
  model?: string;
  serialNumber?: string;
  category?: string;
  status?: string;
  location?: string;
  [key: string]: string | undefined;
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

// Durum seçenekleri
const statusOptions = [
  { value: 'Available', label: 'Kullanılabilir' },
  { value: 'InUse', label: 'Kullanımda' },
  { value: 'Maintenance', label: 'Bakımda' },
  { value: 'Broken', label: 'Arızalı' }
];

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
  }
];

export default function EditEquipment() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  
  // Form durumu
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    model: '',
    serialNumber: '',
    category: '',
    status: 'Available',
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    currentProject: '',
    assignedTo: '',
    location: '',
    specs: [],
    notes: ''
  });
  
  // Ekipman yükleme durumu
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
          const equipment = sampleEquipment.find(item => item.id === equipmentId);
          
          if (equipment) {
            // Specs object'ini array'e dönüştür
            const specsArray = Object.entries(equipment.specs).map(([key, value]) => ({
              key,
              value
            }));
            
            // FormData'yı doldur
            setFormData({
              name: equipment.name,
              model: equipment.model,
              serialNumber: equipment.serialNumber,
              category: equipment.category,
              status: equipment.status,
              purchaseDate: equipment.purchaseDate || '',
              lastMaintenanceDate: equipment.lastMaintenanceDate || '',
              nextMaintenanceDate: equipment.nextMaintenanceDate || '',
              currentProject: equipment.currentProject || '',
              assignedTo: equipment.assignedTo || '',
              location: equipment.location,
              specs: specsArray.length > 0 ? specsArray : [{ key: '', value: '' }],
              notes: equipment.notes || ''
            });
            
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
  
  // Form alanlarını güncelleme
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Teknik özellik alanlarını güncelleme
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecs = [...formData.specs];
    updatedSpecs[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      specs: updatedSpecs
    }));
  };
  
  // Yeni teknik özellik alanı ekleme
  const addSpecField = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { key: '', value: '' }]
    }));
  };
  
  // Teknik özellik alanını silme
  const removeSpecField = (index: number) => {
    if (formData.specs.length > 1) {
      const updatedSpecs = [...formData.specs];
      updatedSpecs.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        specs: updatedSpecs
      }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ekipman adı gereklidir';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Model bilgisi gereklidir';
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Seri numarası gereklidir';
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gereklidir';
    }
    
    if (!formData.status) {
      newErrors.status = 'Durum seçimi gereklidir';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Konum bilgisi gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    try {
      // Specs array'ini object'e dönüştür
      const specsObject: Record<string, string> = {};
      formData.specs.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObject[spec.key] = spec.value;
        }
      });
      // API isteği için ekipman verilerini hazırla - Backend formatına uygun
      const equipmentData: any = {
        name: formData.name,
        type: formData.category || undefined, // Backend'de type olarak geçiyor
        model: formData.model,
        serialNumber: formData.serialNumber,
        status: (formData.status === 'Available' ? 'AVAILABLE' :
                formData.status === 'InUse' ? 'IN_USE' :
                formData.status === 'Maintenance' ? 'MAINTENANCE' : 'DAMAGED') as 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED',
        location: formData.location,
        notes: formData.notes.trim() || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        responsibleUser: formData.assignedTo || undefined
      };
      // Gerçek API çağrısı
      await updateEquipment(equipmentId, equipmentData as any);
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => {
        router.push(`/admin/equipment/view/${equipmentId}`);
      }, 2000);
    } catch (error) {
      setSubmitting(false);
      setErrors(prev => ({
        ...prev,
        general: 'Ekipman güncellenirken bir hata oluştu. Lütfen tekrar deneyiniz.'
      }));
    }
  };

  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ekipman Düzenle</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ekipman bilgilerini güncelleyebilirsiniz
          </p>
        </div>
        <Link href={`/admin/equipment/view/${equipmentId}`}>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md shadow-sm text-sm font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            İptal Et
          </button>
        </Link>
      </div>
      
      {/* Yükleniyor durumu */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-700 dark:text-gray-300">Ekipman bilgileri yükleniyor...</span>
        </div>
      )}
      
      {/* Hata durumu */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Ekipman listesine dönmek için <Link href="/admin/equipment" className="font-semibold underline">tıklayın</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Başarı mesajı */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Ekipman başarıyla güncellendi!</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Detay sayfasına yönlendiriliyorsunuz...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Genel hata */}
      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">İşlem başarısız</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{errors.general}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form */}
      {!loading && !error && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Temel Bilgiler */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Temel Bilgiler</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Ekipman Adı */}
                <div className="sm:col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ekipman Adı <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="Ekipman adını girin"
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.name}</p>}
                  </div>
                </div>
                
                {/* Model ve Seri Numarası */}
                <div className="sm:col-span-3">
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="model"
                      id="model"
                      value={formData.model}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.model ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="Model bilgisini girin"
                    />
                    {errors.model && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.model}</p>}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seri Numarası <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="serialNumber"
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.serialNumber ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="Seri numarasını girin"
                    />
                    {errors.serialNumber && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.serialNumber}</p>}
                  </div>
                </div>
                
                {/* Kategori ve Durum */}
                <div className="sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.category ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.category}</p>}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Durum <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.status ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.status}</p>}
                  </div>
                </div>
                
                {/* Konum */}
                <div className="sm:col-span-6">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Konum <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md ${errors.location ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      placeholder="Ekipmanın bulunduğu konum"
                    />
                    {errors.location && <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.location}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarih Bilgileri */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Tarih Bilgileri</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Satın Alma Tarihi */}
                <div className="sm:col-span-2">
                  <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Satın Alma Tarihi
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="purchaseDate"
                      id="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>
                
                {/* Son Bakım Tarihi */}
                <div className="sm:col-span-2">
                  <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Son Bakım Tarihi
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="lastMaintenanceDate"
                      id="lastMaintenanceDate"
                      value={formData.lastMaintenanceDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>
                
                {/* Sonraki Bakım Tarihi */}
                <div className="sm:col-span-2">
                  <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sonraki Bakım Tarihi
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="nextMaintenanceDate"
                      id="nextMaintenanceDate"
                      value={formData.nextMaintenanceDate}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Proje Bilgileri (Status == InUse ise) */}
          {formData.status === 'InUse' && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Proje Bilgileri</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Proje */}
                  <div className="sm:col-span-3">
                    <label htmlFor="currentProject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mevcut Proje
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="currentProject"
                        id="currentProject"
                        value={formData.currentProject}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Ekipmanın kullanıldığı proje"
                      />
                    </div>
                  </div>
                  
                  {/* Sorumlu */}
                  <div className="sm:col-span-3">
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sorumlu Kişi
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="assignedTo"
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Ekipmandan sorumlu kişi"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Teknik Özellikler */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Teknik Özellikler</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {formData.specs.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Özellik (örn: Çözünürlük)"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Değer (örn: 4K 60Hz)"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeSpecField(index)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addSpecField}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Özellik Ekle
              </button>
            </div>
          </div>
          
          {/* Notlar */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Notlar</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ek Bilgiler
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Ekipmanla ilgili ek bilgiler, kullanım notları veya özel durumlar"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Butonları */}
          <div className="flex justify-end space-x-3">
            <Link href={`/admin/equipment/view/${equipmentId}`}>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </div>
              ) : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 