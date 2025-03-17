'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

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

// Müşteri türü
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

// Müşteri form türü
interface ClientForm {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export default function EditClient() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  // Form durumu
  const [formData, setFormData] = useState<ClientForm>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    status: 'Active',
    notes: ''
  });
  
  // Diğer durumlar
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Veri yükleme
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const response = await fetch(`/api/admin/clients/${clientId}`);
        // if (!response.ok) throw new Error('Müşteri verileri alınamadı');
        // const data = await response.json();
        // setClient(data);
        // setFormData({
        //   name: data.name,
        //   contactPerson: data.contactPerson,
        //   email: data.email,
        //   phone: data.phone,
        //   address: data.address,
        //   industry: data.industry,
        //   status: data.status,
        //   notes: data.notes || ''
        // });
        
        // Şimdilik örnek verileri kullanıyoruz
        setTimeout(() => {
          const foundClient = sampleClients.find(c => c.id === clientId);
          
          if (foundClient) {
            setClient(foundClient);
            setFormData({
              name: foundClient.name,
              contactPerson: foundClient.contactPerson,
              email: foundClient.email,
              phone: foundClient.phone,
              address: foundClient.address,
              industry: foundClient.industry,
              status: foundClient.status,
              notes: foundClient.notes || ''
            });
          }
          
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // Form değişikliği işleyici
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // O alan için hatayı temizle
    if (errors[name as keyof ClientForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientForm, string>> = {};
    
    // Zorunlu alanlar
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
  
  // Form gönderim işleyici
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API entegrasyonu olduğunda burada backend'e istek gönderilecek
      // const response = await fetch(`/api/admin/clients/${clientId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Müşteri güncellenirken bir hata oluştu');
      // }
      // 
      // const data = await response.json();
      
      // Şimdilik API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Başarı durumu göster
      setShowSuccessNotification(true);
      
      // 2 saniye sonra müşteri detay sayfasına yönlendir
      setTimeout(() => {
        router.push(`/admin/clients/view/${clientId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      setErrors({
        ...errors,
        form: 'Müşteri güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      });
      setIsSubmitting(false);
    }
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
          Düzenlemek istediğiniz müşteri bulunamadı. Müşteri silinmiş olabilir veya geçersiz bir ID belirtmiş olabilirsiniz.
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
      {/* Üst bölüm - başlık ve geri butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Müşteri Düzenle</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            {client?.name} müşterisinin bilgilerini güncelleyin
          </p>
        </div>
        <Link href={`/admin/clients/view/${clientId}`}>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Müşteri Detayına Dön
          </button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Form kartı */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
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
              </div>
              
              {/* Form Alt Kısmı - Gönderme Butonları */}
      {/* Form alanı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Başarı mesajı */}
          {submitSuccess && (
            <div className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400 dark:text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p>Müşteri başarıyla güncellendi! Müşteri sayfasına yönlendiriliyorsunuz...</p>
              </div>
            </div>
          )}
          
          {/* Hata mesajı */}
          {submitError && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p>{submitError}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Temel Bilgiler */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                Temel Bilgiler
              </h3>
              
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
                  className={`w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
                  placeholder="Müşteri firma adı"
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
                  className={`w-full px-3 py-2 border ${
                    errors.contactPerson ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
                  placeholder="Müşteri yetkili kişinin adı soyadı"
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
                  className={`w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
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
                  className={`w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
                  placeholder="+90 555 123 45 67"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
              </div>
            </div>
            
            {/* Ek Bilgiler */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                Ek Bilgiler
              </h3>
              
              {/* Adres */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.address ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
                  placeholder="Müşteri firma adresi"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>}
              </div>
              
              {/* Endüstri */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endüstri <span className="text-red-500">*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.industry ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white`}
                >
                  <option value="">Endüstri Seçin</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {errors.industry && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry}</p>}
              </div>
              
              {/* Durum */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durum
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="statusActive"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0066CC] dark:text-primary-light focus:ring-[#0066CC] dark:focus:ring-primary-light border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="statusActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Aktif
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="statusInactive"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#0066CC] dark:text-primary-light focus:ring-[#0066CC] dark:focus:ring-primary-light border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="statusInactive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Pasif
                    </label>
                  </div>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] dark:focus:ring-primary-light dark:focus:border-primary-light dark:bg-gray-900/50 dark:text-white"
                  placeholder="Müşteri hakkında önemli notlar"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Form Butonları */}
          <div className="mt-10 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Link href={`/admin/clients/view/${clientId}`}>
              <button 
                type="button" 
                className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting || submitSuccess}
              className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                submitting || submitSuccess
                  ? 'bg-[#0066CC]/70 dark:bg-primary-light/70 cursor-not-allowed'
                  : 'bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary'
              } focus:outline-none transition-colors flex items-center`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : submitSuccess ? (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Kaydedildi
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 