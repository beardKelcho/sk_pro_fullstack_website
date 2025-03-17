'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Müşteri statüsü için tip tanımı
type ClientStatus = 'Active' | 'Inactive';

// Form veri tipi
interface FormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: ClientStatus;
  notes?: string;
}

// Endüstri seçenekleri
const industryOptions = [
  'Etkinlik Organizasyonu',
  'Kurumsal',
  'Televizyon',
  'Konser & Sahne',
  'Müze & Sergi',
  'Eğitim',
  'Spor Etkinlikleri',
  'Festival',
  'Fuar & Kongre',
  'Diğer'
];

export default function AddClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: 'Etkinlik Organizasyonu',
    status: 'Active',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Form alanlarını değiştirme işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata varsa temizle
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Zorunlu alanları kontrol et
    if (!formData.name.trim()) {
      newErrors.name = 'Müşteri adı gereklidir';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'İletişim kişisi gereklidir';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form gönderme işleyicisi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API entegrasyonu olduğunda burada backend'e veri gönderilecek
      // const response = await fetch('/api/admin/clients', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Müşteri eklenirken bir hata oluştu');
      // }
      
      // Simüle edilmiş başarılı yanıt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessNotification(true);
      
      // 2 saniye sonra müşteri listesine yönlendir
      setTimeout(() => {
        router.push('/admin/clients');
      }, 2000);
      
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      setErrors({
        ...errors,
        form: 'Müşteri eklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve eylem butonları */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/clients" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Müşteri Ekle</h1>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Sistemde yeni bir müşteri oluşturun</p>
        </div>
        <Link href="/admin/clients">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            İptal
          </button>
        </Link>
      </div>
      
      {/* Form alanı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Genel hata mesajı */}
          {errors.form && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400">
              <p>{errors.form}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sol kolon - Temel Bilgiler */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Temel Bilgiler</h2>
              
              {/* Müşteri Adı */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Müşteri Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${
                    errors.name 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                  } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  placeholder="Şirket veya organizasyon adı"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
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
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${
                    errors.contactPerson 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                  } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  placeholder="Müşteri temsilcisi veya yetkili kişi"
                />
                {errors.contactPerson && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPerson}</p>}
              </div>
              
              {/* E-posta */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${
                    errors.email 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                  } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  placeholder="ornek@sirket.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>
              
              {/* Telefon */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${
                    errors.phone 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                  } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  placeholder="+90 5XX XXX XX XX"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
              </div>
            </div>
            
            {/* Sağ kolon - Ek Bilgiler ve Durum */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Ek Bilgiler</h2>
              
              {/* Adres */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adres <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${
                    errors.address 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                  } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  placeholder="Tam adres"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>}
              </div>
              
              {/* Endüstri */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endüstri
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                >
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              {/* Durum */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Müşteri Durumu
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                >
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Pasif</option>
                </select>
              </div>
              
              {/* Notlar */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notlar
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  placeholder="Müşteri hakkında önemli notlar ve hatırlatmalar"
                />
              </div>
            </div>
          </div>
          
          {/* Form Alt Kısmı - Gönderme Butonları */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Link href="/admin/clients">
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </>
              ) : 'Müşteri Ekle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Başarı bildirimi */}
      {showSuccessNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p className="font-medium">Müşteri başarıyla eklendi!</p>
            <p className="text-sm">Müşteri listesine yönlendiriliyorsunuz...</p>
          </div>
        </div>
      )}
    </div>
  );
} 