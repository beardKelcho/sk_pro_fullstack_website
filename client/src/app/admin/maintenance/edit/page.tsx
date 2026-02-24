'use client';
import { Suspense } from 'react';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMaintenanceById, updateMaintenance } from '@/services/maintenanceService';
import type { Maintenance } from '@/services/maintenanceService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

// Form tipi
interface MaintenanceForm {
  equipmentId: string;
  type: 'Periyodik' | 'Arıza' | 'Kalibrasyon' | 'Güncelleme';
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  description: string;
  assignedTo: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  cost?: string;
  parts?: string[];
  nextMaintenanceDate?: string;
  status: 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi';
}

// Örnek ekipman listesi
const sampleEquipment = [
  { id: '1', name: 'Analog Way Aquilon RS4', category: 'Video Switcher' },
  { id: '2', name: 'Dataton Watchpax 60', category: 'Media Server' },
  { id: '3', name: 'Barco UDX-4K32', category: 'Projeksiyon' },
  { id: '4', name: 'ROE Visual CB5', category: 'LED Panel' }
];

// Örnek teknisyen listesi
const sampleTechnicians = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Teknik Direktör' },
  { id: '2', name: 'Mehmet Demir', role: 'Teknisyen' },
  { id: '3', name: 'Ayşe Şahin', role: 'Teknisyen' }
];

function EditMaintenanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const maintenanceId = (searchParams.get('id') as string);
  
  // Form state'i
  const [formData, setFormData] = useState<MaintenanceForm>({
    equipmentId: '',
    type: 'Periyodik',
    priority: 'Orta',
    description: '',
    assignedTo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    cost: undefined,
    parts: [],
    nextMaintenanceDate: '',
    status: 'Planlandı'
  });
  
  // Parça girişi için state
  const [partInput, setPartInput] = useState('');
  
  // Yükleme ve hata durumları
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
  // Bakım verilerini yükle
  useEffect(() => {
    const fetchMaintenance = async () => {
      setLoading(true);
      try {
        const data = await getMaintenanceById(maintenanceId);
        // Backend formatını frontend formatına dönüştür
        const equipmentId = typeof data.equipment === 'string' ? data.equipment : (data.equipment as any)?._id || (data.equipment as any)?.id || '';
        const type = data.type === 'ROUTINE' ? 'Periyodik' :
                     data.type === 'REPAIR' ? 'Arıza' :
                     data.type === 'INSPECTION' ? 'Kalibrasyon' : 'Güncelleme';
        const status = data.status === 'SCHEDULED' ? 'Planlandı' :
                       data.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                       data.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi';
        const assignedTo = typeof data.assignedTo === 'string' ? data.assignedTo : (data.assignedTo as any)?._id || (data.assignedTo as any)?.id || '';
        
        setFormData({
          equipmentId,
          type,
          priority: 'Orta', // Backend'de priority yok, varsayılan değer
          description: data.description,
          assignedTo,
          startDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
          endDate: data.completedDate ? data.completedDate.split('T')[0] : '',
          notes: data.notes || '',
          cost: data.cost?.toString() || '',
          parts: [],
          nextMaintenanceDate: '',
          status
        });
      } catch (error) {
        setErrors({
          general: 'Bakım kaydı yüklenirken bir hata oluştu'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaintenance();
  }, [maintenanceId]);
  
  // Form değişikliği işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Maliyet için özel işlem
    if (name === 'cost') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue || undefined
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Hataları temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Parça ekleme
  const handleAddPart = () => {
    if (partInput.trim() && !formData.parts?.includes(partInput.trim())) {
      setFormData(prev => ({
        ...prev,
        parts: [...(prev.parts || []), partInput.trim()]
      }));
      setPartInput('');
    }
  };
  
  // Parça silme
  const handleRemovePart = (partToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts?.filter(part => part !== partToRemove) || []
    }));
  };
  
  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.equipmentId) {
      newErrors.equipmentId = 'Ekipman seçimi zorunludur';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama zorunludur';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Teknisyen seçimi zorunludur';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Başlangıç tarihi zorunludur';
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
    }
    
    if (formData.nextMaintenanceDate && new Date(formData.nextMaintenanceDate) < new Date()) {
      newErrors.nextMaintenanceDate = 'Sonraki bakım tarihi bugünden sonra olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Backend formatına uygun veri hazırla
      // Tarihleri ISO8601 formatına çevir (yyyy-MM-dd -> ISO string)
      const scheduledDateISO = formData.startDate ? new Date(formData.startDate + 'T00:00:00').toISOString() : undefined;
      const completedDateISO = formData.endDate ? new Date(formData.endDate + 'T00:00:00').toISOString() : undefined;
      
      const maintenanceData = {
        equipment: formData.equipmentId,
        type: formData.type === 'Periyodik' ? 'ROUTINE' :
              formData.type === 'Arıza' ? 'REPAIR' :
              formData.type === 'Kalibrasyon' ? 'INSPECTION' : 'UPGRADE',
        description: formData.description,
        scheduledDate: scheduledDateISO,
        completedDate: completedDateISO,
        status: formData.status === 'Planlandı' ? 'SCHEDULED' :
                formData.status === 'Devam Ediyor' ? 'IN_PROGRESS' :
                formData.status === 'Tamamlandı' ? 'COMPLETED' : 'CANCELLED',
        assignedTo: formData.assignedTo,
        cost: formData.cost ? Number(formData.cost) : undefined,
        notes: formData.notes
      };
      await updateMaintenance(maintenanceId, maintenanceData as any);
      toast.success('Bakım kaydı başarıyla güncellendi');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/admin/maintenance');
      }, 2000);
      
    } catch (error: any) {
      logger.error('Bakım kaydı güncelleme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Bakım kaydı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
      setErrors({
        submit: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Para birimini formatlama
  const formatCurrency = (value?: string | number) => {
    if (value === undefined || value === '') return '';
    const numValue = typeof value === 'string' ? Number(value) : value;
    if (isNaN(numValue)) return '';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (errors.general) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
        {errors.general}
        <div className="mt-2">
          <Link href="/admin/maintenance">
            <button className="text-red-700 dark:text-red-300 underline">
              Bakım listesine dön
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bakım Düzenle</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Bakım kaydını güncelleyin</p>
        </div>
        <Link href="/admin/maintenance">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            İptal
          </button>
        </Link>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ekipman */}
            <div>
              <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ekipman <span className="text-red-500">*</span>
              </label>
              <select
                id="equipmentId"
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.equipmentId ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
              >
                <option value="">Ekipman Seçin</option>
                {sampleEquipment.map(equipment => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} ({equipment.category})
                  </option>
                ))}
              </select>
              {errors.equipmentId && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.equipmentId}</p>}
            </div>
            
            {/* Teknisyen */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teknisyen <span className="text-red-500">*</span>
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.assignedTo ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
              >
                <option value="">Teknisyen Seçin</option>
                {sampleTechnicians.map(technician => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name} ({technician.role})
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.assignedTo}</p>}
            </div>
            
            {/* Bakım Tipi */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bakım Tipi
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
              >
                <option value="Periyodik">Periyodik Bakım</option>
                <option value="Arıza">Arıza Bakımı</option>
                <option value="Kalibrasyon">Kalibrasyon</option>
                <option value="Güncelleme">Güncelleme</option>
              </select>
            </div>
            
            {/* Öncelik */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Öncelik
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
              >
                <option value="Düşük">Düşük</option>
                <option value="Orta">Orta</option>
                <option value="Yüksek">Yüksek</option>
                <option value="Acil">Acil</option>
              </select>
            </div>
            
            {/* Durum */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
              >
                <option value="Planlandı">Planlandı</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="İptal Edildi">İptal Edildi</option>
              </select>
            </div>
            
            {/* Başlangıç Tarihi */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Başlangıç Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.startDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.startDate}</p>}
            </div>
            
            {/* Bitiş Tarihi */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.endDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.endDate}</p>}
            </div>
          </div>
        </div>
        
        {/* Detaylar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Detaylar</h2>
          <div className="space-y-6">
            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                placeholder="Bakım detaylarını girin"
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.description}</p>}
            </div>
            
            {/* Notlar */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                placeholder="Ek notlar"
              ></textarea>
            </div>
            
            {/* Parçalar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kullanılan/Değiştirilen Parçalar
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={partInput}
                  onChange={(e) => setPartInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPart())}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-l-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  placeholder="Parça adı ve detayı"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Ekle
                </button>
              </div>
              
              {formData.parts && formData.parts.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.parts.map((part, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                    >
                      {part}
                      <button
                        type="button"
                        onClick={() => handleRemovePart(part)}
                        className="ml-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz parça eklenmemiş.</p>
              )}
            </div>
            
            {/* Maliyet */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maliyet (TL)
              </label>
              <input
                type="text"
                id="cost"
                name="cost"
                value={formData.cost ? formatCurrency(formData.cost) : ''}
                onChange={handleChange}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                placeholder="₺0"
              />
            </div>
            
            {/* Sonraki Bakım Tarihi */}
            <div>
              <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sonraki Bakım Tarihi
              </label>
              <input
                type="date"
                id="nextMaintenanceDate"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleChange}
                className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.nextMaintenanceDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
              />
              {errors.nextMaintenanceDate && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.nextMaintenanceDate}</p>}
            </div>
          </div>
        </div>
        
        {/* Gönderme Hatası */}
        {errors.submit && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
            {errors.submit}
          </div>
        )}
        
        {/* Form Butonları */}
        <div className="flex justify-end space-x-3">
          <Link href="/admin/maintenance">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              İptal
            </button>
          </Link>
          <button
            type="submit"
            disabled={submitting || success}
            className={`px-6 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors flex items-center ${(submitting || success) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </>
            ) : success ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 
export default function EditMaintenance() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] dark:border-primary"></div>
      </div>
    }>
      <EditMaintenanceContent />
    </Suspense>
  );
}
