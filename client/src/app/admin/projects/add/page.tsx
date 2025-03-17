'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Proje durumları için tip tanımlaması
type ProjectStatus = 'Planlama' | 'Devam Ediyor' | 'Tamamlandı' | 'Ertelendi' | 'İptal Edildi';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: string;
}

interface Customer {
  id: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
}

// Form verisi için tip tanımlaması
interface ProjectFormData {
  name: string;
  description: string;
  customer: string;
  customerName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  location: string;
  status: ProjectStatus;
  budget: string; // String olarak alıp, işlerken sayıya çevireceğiz
  team: string[];
  equipment: string[];
  notes: string;
}

// Örnek ekip üyeleri
const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'Mehmet Kaya', role: 'Görüntü Yönetmeni', email: 'm.kaya@skproduction.com', phone: '+90 533 765 43 21' },
  { id: '2', name: 'Zeynep Demir', role: 'Media Server Operatörü', email: 'z.demir@skproduction.com', phone: '+90 535 987 65 43' },
  { id: '3', name: 'Ali Yıldız', role: 'Teknik Direktör', email: 'a.yildiz@skproduction.com', phone: '+90 536 234 56 78' },
  { id: '4', name: 'Ayşe Şahin', role: 'Işık Tasarımcısı', email: 'a.sahin@skproduction.com', phone: '+90 537 345 67 89' },
  { id: '5', name: 'Burak Demir', role: 'Ses Mühendisi', email: 'b.demir@skproduction.com', phone: '+90 538 456 78 90' },
  { id: '6', name: 'Selin Kara', role: 'Proje Koordinatörü', email: 's.kara@skproduction.com', phone: '+90 539 567 89 01' }
];

// Örnek ekipmanlar
const sampleEquipments: Equipment[] = [
  { id: '1', name: 'Analog Way Aquilon RS4', model: 'RS4', serialNumber: 'AW2023456', category: 'VideoSwitcher' },
  { id: '2', name: 'Analog Way Pulse 4K', model: 'Pulse 4K', serialNumber: 'AW2023789', category: 'VideoSwitcher' },
  { id: '3', name: 'Dataton Watchpax 60', model: 'Watchpax 60', serialNumber: 'DT789012', category: 'MediaServer' },
  { id: '4', name: 'Barco UDX-4K32', model: 'UDX-4K32', serialNumber: 'BC456789', category: 'Projeksiyon' },
  { id: '5', name: 'Samsung LED Wall', model: 'The Wall', serialNumber: 'SM123456', category: 'LED' },
  { id: '6', name: 'Shure ULXD4', model: 'ULXD4', serialNumber: 'SH345678', category: 'AudioEquipment' }
];

// Örnek müşteriler
const sampleCustomers: Customer[] = [
  { id: '1', companyName: 'TechEvents A.Ş.', name: 'Ahmet Yılmaz', email: 'ahmet@techevents.com', phone: '+90 532 123 45 67' },
  { id: '2', companyName: 'Mega Organizasyon', name: 'Ebru Kaya', email: 'ebru@megaorg.com', phone: '+90 533 234 56 78' },
  { id: '3', companyName: 'İstanbul Etkinlik', name: 'Murat Demir', email: 'murat@istanbuletkinlik.com', phone: '+90 534 345 67 89' },
  { id: '4', companyName: 'Kongre A.Ş.', name: 'Canan Öztürk', email: 'canan@kongre.com', phone: '+90 535 456 78 90' }
];

export default function AddProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form verileri
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    customer: '',
    customerName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 hafta sonrası
    location: '',
    status: 'Planlama',
    budget: '',
    team: [],
    equipment: [],
    notes: ''
  });
  
  // Form hatalarını izlemek için state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Arama ve seçim state'leri
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [showEquipmentSelect, setShowEquipmentSelect] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  
  // Filtrelenmiş listeler
  const filteredTeamMembers = teamSearchTerm
    ? sampleTeamMembers.filter(member => 
        member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(teamSearchTerm.toLowerCase())
      )
    : sampleTeamMembers;
    
  const filteredEquipments = equipmentSearchTerm
    ? sampleEquipments.filter(equipment => 
        equipment.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
        equipment.category.toLowerCase().includes(equipmentSearchTerm.toLowerCase())
      )
    : sampleEquipments;
    
  const filteredCustomers = customerSearchTerm
    ? sampleCustomers.filter(customer => 
        customer.companyName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
      )
    : sampleCustomers;
  
  // Form alanı değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Eğer başlangıç tarihi, bitiş tarihinden sonraysa, bitiş tarihini güncelle
      if (name === 'startDate' && new Date(value) > new Date(prev.endDate)) {
        return { ...prev, [name]: value, endDate: value };
      }
      
      return { ...prev, [name]: value };
    });
    
    // Hata mesajlarını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Para birimini formatlama fonksiyonu
  const formatCurrency = (value: string) => {
    // Sadece sayıları al
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (numericValue) {
      // Sayıyı formatla
      const formatted = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(parseInt(numericValue));
      
      return formatted;
    }
    
    return '';
  };
  
  // Bütçe değişikliklerini işle
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Sadece sayıları al
    const numericValue = value.replace(/[^\d]/g, '');
    
    setFormData(prev => ({
      ...prev,
      budget: numericValue
    }));
    
    // Hata mesajlarını temizle
    if (errors.budget) {
      setErrors(prev => ({ ...prev, budget: '' }));
    }
  };
  
  // Ekip üyesi ekleme/çıkarma
  const toggleTeamMember = (memberId: string) => {
    setFormData(prev => {
      const isSelected = prev.team.includes(memberId);
      
      if (isSelected) {
        return {
          ...prev,
          team: prev.team.filter(id => id !== memberId)
        };
      } else {
        return {
          ...prev,
          team: [...prev.team, memberId]
        };
      }
    });
  };
  
  // Ekipman ekleme/çıkarma
  const toggleEquipment = (equipmentId: string) => {
    setFormData(prev => {
      const isSelected = prev.equipment.includes(equipmentId);
      
      if (isSelected) {
        return {
          ...prev,
          equipment: prev.equipment.filter(id => id !== equipmentId)
        };
      } else {
        return {
          ...prev,
          equipment: [...prev.equipment, equipmentId]
        };
      }
    });
  };
  
  // Müşteri seçme
  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer: customer.id,
      customerName: customer.companyName,
      contactPerson: customer.name,
      contactEmail: customer.email,
      contactPhone: customer.phone
    }));
    
    setCustomerSearchTerm('');
    setShowCustomerList(false);
  };
  
  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Zorunlu alanları kontrol et
    if (!formData.name.trim()) newErrors.name = 'Proje adı zorunludur';
    if (!formData.customerName.trim()) newErrors.customerName = 'Müşteri bilgisi zorunludur';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'İletişim kişisi zorunludur';
    if (!formData.location.trim()) newErrors.location = 'Lokasyon zorunludur';
    
    // Tarihleri kontrol et
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate < startDate) {
      newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
    }
    
    // Bütçeyi kontrol et
    if (formData.budget.trim() && isNaN(parseInt(formData.budget.trim()))) {
      newErrors.budget = 'Bütçe geçerli bir sayı olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // API isteği simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Başarılı sonuç sonrası yönlendirme
      setTimeout(() => {
        router.push('/admin/projects');
      }, 2000);
    } catch (error) {
      console.error('Proje eklenirken hata oluştu:', error);
      setErrors({ submit: 'Proje eklenirken bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yeni Proje Ekle</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Firma projelerini ve etkinliklerini buradan ekleyebilirsiniz.
      </p>
      
      {/* Başarı mesajı */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p>Proje başarıyla eklendi! Proje listesine yönlendiriliyorsunuz...</p>
          </div>
        </div>
      )}
      
      {/* Genel hata mesajı */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>{errors.submit}</p>
          </div>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proje Adı */}
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                placeholder="Örn: Teknoloji Zirvesi 2023"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            {/* Müşteri/Firma */}
            <div className="relative">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Müşteri/Firma <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={(e) => {
                    handleChange(e);
                    setCustomerSearchTerm(e.target.value);
                    if (e.target.value) setShowCustomerList(true);
                  }}
                  onFocus={() => setShowCustomerList(true)}
                  className={`block w-full px-3 py-2 border ${errors.customerName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                  placeholder="Müşteri firma adı"
                  required
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerName}</p>
                )}
                
                {/* Müşteri Arama Sonuçları */}
                {showCustomerList && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.companyName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.name} • {customer.email}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Müşteri bulunamadı
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* İletişim Kişisi */}
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İletişim Kişisi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.contactPerson ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                placeholder="İletişim kurulacak kişi"
                required
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPerson}</p>
              )}
            </div>
            
            {/* İletişim Bilgileri */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                  placeholder="E-posta adresi"
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                  placeholder="Telefon numarası"
                />
              </div>
            </div>
            
            {/* Lokasyon */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lokasyon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${errors.location ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                placeholder="Örn: İstanbul Kongre Merkezi"
                required
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
              )}
            </div>
            
            {/* Tarih Bilgileri */}
            <div className="grid grid-cols-2 gap-3">
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
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${errors.endDate ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                  required
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
                )}
              </div>
            </div>
            
            {/* Durum ve Bütçe */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durum <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="Planlama">Planlama</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Ertelendi">Ertelendi</option>
                <option value="İptal Edildi">İptal Edildi</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bütçe
              </label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget ? formatCurrency(formData.budget) : ''}
                onChange={handleBudgetChange}
                className={`block w-full px-3 py-2 border ${errors.budget ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm`}
                placeholder="Örn: ₺50.000"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget}</p>
              )}
            </div>
            
            {/* Proje Ekibi */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proje Ekibi
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.team.length > 0 
                        ? `Seçilen ${formData.team.length} ekip üyesi` 
                        : 'Henüz ekip üyesi seçilmedi'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTeamSelect(!showTeamSelect)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                  >
                    {showTeamSelect ? 'Gizle' : 'Ekip Seç'}
                  </button>
                </div>
                
                {/* Seçilen ekip üyeleri */}
                {formData.team.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {formData.team.map(memberId => {
                      const member = sampleTeamMembers.find(m => m.id === memberId);
                      return member ? (
                        <span 
                          key={member.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          {member.name}
                          <button
                            type="button"
                            onClick={() => toggleTeamMember(member.id)}
                            className="ml-1.5 inline-flex items-center justify-center text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* Ekip üyesi seçim paneli */}
                {showTeamSelect && (
                  <div className="mt-2">
                    <div className="mb-2">
                      <input
                        type="text"
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        placeholder="Ekip üyesi ara..."
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      {filteredTeamMembers.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredTeamMembers.map(member => (
                            <li key={member.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.team.includes(member.id)}
                                  onChange={() => toggleTeamMember(member.id)}
                                  className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <span className="ml-3 block">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.name}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 block">{member.role}</span>
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">Eşleşen ekip üyesi bulunamadı</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ekipman */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ekipman
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.equipment.length > 0 
                        ? `Seçilen ${formData.equipment.length} ekipman` 
                        : 'Henüz ekipman seçilmedi'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEquipmentSelect(!showEquipmentSelect)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                  >
                    {showEquipmentSelect ? 'Gizle' : 'Ekipman Seç'}
                  </button>
                </div>
                
                {/* Seçilen ekipmanlar */}
                {formData.equipment.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {formData.equipment.map(equipmentId => {
                      const equipment = sampleEquipments.find(e => e.id === equipmentId);
                      return equipment ? (
                        <span 
                          key={equipment.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {equipment.name}
                          <button
                            type="button"
                            onClick={() => toggleEquipment(equipment.id)}
                            className="ml-1.5 inline-flex items-center justify-center text-green-400 hover:text-green-600 dark:hover:text-green-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                
                {/* Ekipman seçim paneli */}
                {showEquipmentSelect && (
                  <div className="mt-2">
                    <div className="mb-2">
                      <input
                        type="text"
                        value={equipmentSearchTerm}
                        onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                        placeholder="Ekipman ara..."
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                      {filteredEquipments.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredEquipments.map(equipment => (
                            <li key={equipment.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.equipment.includes(equipment.id)}
                                  onChange={() => toggleEquipment(equipment.id)}
                                  className="h-4 w-4 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-500 border-gray-300 dark:border-gray-600 rounded"
                                />
                                <span className="ml-3 block">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{equipment.name}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 block">{equipment.model} • {equipment.category}</span>
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">Eşleşen ekipman bulunamadı</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Proje Açıklaması */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proje Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                placeholder="Projenin detaylarını ve kapsamını buraya girin..."
              ></textarea>
            </div>
            
            {/* Notlar */}
            <div className="col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ek Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 sm:text-sm"
                placeholder="Proje ile ilgili diğer önemli bilgileri buraya ekleyin..."
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Form Butonları */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Link href="/admin/projects">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            >
              İptal
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </div>
            ) : 'Projeyi Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
} 