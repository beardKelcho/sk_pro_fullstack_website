'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Ekipman türü tanımlama
interface Equipment {
  id?: string;
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

export default function AddEquipment() {
  const router = useRouter();
  
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
    specs: [{ key: '', value: '' }],
    notes: ''
  });
  
  // Form işleme durumları
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  
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
    
    setLoading(true);
    
    try {
      // Specs array'ini object'e dönüştür
      const specsObject: Record<string, string> = {};
      
      formData.specs.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specsObject[spec.key] = spec.value;
        }
      });
      
      // API isteği için ekipman verilerini hazırla
      const equipmentData: Omit<Equipment, 'id'> = {
        name: formData.name,
        model: formData.model,
        serialNumber: formData.serialNumber,
        category: formData.category as Equipment['category'],
        status: formData.status as Equipment['status'],
        location: formData.location,
        specs: specsObject,
        notes: formData.notes.trim() || undefined
      };
      
      // İsteğe bağlı alanları ekle
      if (formData.purchaseDate) equipmentData.purchaseDate = formData.purchaseDate;
      if (formData.lastMaintenanceDate) equipmentData.lastMaintenanceDate = formData.lastMaintenanceDate;
      if (formData.nextMaintenanceDate) equipmentData.nextMaintenanceDate = formData.nextMaintenanceDate;
      if (formData.currentProject) equipmentData.currentProject = formData.currentProject;
      if (formData.assignedTo) equipmentData.assignedTo = formData.assignedTo;
      
      // Gerçek API entegrasyonu burada yapılacak
      // const response = await fetch('/api/admin/equipment', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(equipmentData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Ekipman eklenirken bir hata oluştu');
      // }
      
      // Başarılı işlem sonrası
      console.log('Ekipman veri ekleme isteği:', equipmentData);
      
      // API çağrısını simüle et
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setLoading(false);
      
      // 2 saniye sonra ekipman listesine yönlendir
      setTimeout(() => {
        router.push('/admin/equipment');
      }, 2000);
      
    } catch (error) {
      console.error('Ekipman ekleme hatası:', error);
      setLoading(false);
      
      // Genel hata mesajı göster
      setErrors(prev => ({
        ...prev,
        general: 'Ekipman eklenirken bir hata oluştu. Lütfen tekrar deneyiniz.'
      }));
    }
  };
  
  // Stil sınıfları
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const inputClass = "bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5";
  const inputErrorClass = "bg-gray-50 dark:bg-gray-900/50 border border-red-500 dark:border-red-500 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500 block w-full p-2.5";
  
  return (
    <div>
      {/* Başlık bölümü */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Ekipman Ekle</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Teknik ekipman envanterine yeni bir cihaz ekleyin</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/equipment">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Listeye Dön
            </button>
          </Link>
        </div>
      </div>
      
      {/* Başarılı ekleme mesajı */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p>Ekipman başarıyla eklendi! Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      )}
      
      {/* Hata mesajı */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>{errors.general}</p>
          </div>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Temel Bilgiler */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Ekipman Adı */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Ekipman Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? inputErrorClass : inputClass}
                  placeholder="Örn: Analog Way Aquilon RS4"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              {/* Kategori */}
              <div>
                <label htmlFor="category" className={labelClass}>
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? inputErrorClass : inputClass}
                  required
                >
                  <option value="">Seçiniz</option>
                  {categories.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                )}
              </div>
              
              {/* Durum */}
              <div>
                <label htmlFor="status" className={labelClass}>
                  Durum <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={errors.status ? inputErrorClass : inputClass}
                  required
                >
                  {statusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
              </div>
              
              {/* Model */}
              <div>
                <label htmlFor="model" className={labelClass}>
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={errors.model ? inputErrorClass : inputClass}
                  placeholder="Örn: Aquilon RS4"
                  required
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model}</p>
                )}
              </div>
              
              {/* Seri Numarası */}
              <div>
                <label htmlFor="serialNumber" className={labelClass}>
                  Seri Numarası <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={errors.serialNumber ? inputErrorClass : inputClass}
                  placeholder="Örn: AW-2023-001"
                  required
                />
                {errors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.serialNumber}</p>
                )}
              </div>
              
              {/* Konum */}
              <div>
                <label htmlFor="location" className={labelClass}>
                  Konum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? inputErrorClass : inputClass}
                  placeholder="Örn: Ana Depo"
                  required
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Tarih Bilgileri */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tarih Bilgileri</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Satın Alma Tarihi */}
              <div>
                <label htmlFor="purchaseDate" className={labelClass}>
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              
              {/* Son Bakım Tarihi */}
              <div>
                <label htmlFor="lastMaintenanceDate" className={labelClass}>
                  Son Bakım Tarihi
                </label>
                <input
                  type="date"
                  id="lastMaintenanceDate"
                  name="lastMaintenanceDate"
                  value={formData.lastMaintenanceDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              
              {/* Sonraki Bakım Tarihi */}
              <div>
                <label htmlFor="nextMaintenanceDate" className={labelClass}>
                  Sonraki Bakım Tarihi
                </label>
                <input
                  type="date"
                  id="nextMaintenanceDate"
                  name="nextMaintenanceDate"
                  value={formData.nextMaintenanceDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          
          {/* Proje Bilgileri - Sadece durum "InUse" ise görünür */}
          {formData.status === 'InUse' && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Proje Bilgileri</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Mevcut Proje */}
                <div>
                  <label htmlFor="currentProject" className={labelClass}>
                    Mevcut Proje
                  </label>
                  <input
                    type="text"
                    id="currentProject"
                    name="currentProject"
                    value={formData.currentProject}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Örn: Vodafone Kurumsal Etkinlik"
                  />
                </div>
                
                {/* Atanan Kişi */}
                <div>
                  <label htmlFor="assignedTo" className={labelClass}>
                    Atanan Kişi
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Teknik Özellikler */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Teknik Özellikler</h2>
              
              <button
                type="button"
                onClick={addSpecField}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Özellik Ekle
              </button>
            </div>
            
            {formData.specs.map((spec, index) => (
              <div key={index} className="flex space-x-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className={inputClass}
                    placeholder="Özellik (Örn: inputs)"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    className={inputClass}
                    placeholder="Değer (Örn: 16x 4K60p)"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeSpecField(index)}
                    className="inline-flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    disabled={formData.specs.length === 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Notlar */}
          <div className="mb-6">
            <label htmlFor="notes" className={labelClass}>
              Notlar
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className={inputClass}
              placeholder="Ekipman hakkında ek bilgiler..."
            ></textarea>
          </div>
        </div>
        
        {/* Form Butonları */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3">
          <Link href="/admin/equipment">
            <button 
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            >
              İptal
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm text-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </div>
            ) : (
              "Ekipmanı Kaydet"
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 