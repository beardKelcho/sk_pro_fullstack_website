'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { updateUser, mapBackendRoleToFrontend, mapFrontendRoleToBackend } from '@/services/userService';
import PhoneInput from '@/components/ui/PhoneInput';
import CityDistrictSelect from '@/components/ui/CityDistrictSelect';

// Kullanıcı form tipi
interface UserForm {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Firma Sahibi' | 'Proje Yöneticisi' | 'Depo Sorumlusu' | 'Teknisyen';
  department?: string;
  status: 'Aktif' | 'Pasif';
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  emergencyContact?: string;
}

// Kullanıcı türü
interface User extends UserForm {
  id: string;
  avatar?: string;
  lastActive?: string;
  joinDate?: string;
  projects?: string[];
}

// Rol ve departman seçenekleri
const roles = ['Admin', 'Firma Sahibi', 'Proje Yöneticisi', 'Depo Sorumlusu', 'Teknisyen'];
const departments = ['Yönetim', 'Teknik', 'Medya', 'Görüntü'];

// Örnek kullanıcı verileri
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@skproduction.com',
    role: 'Teknik Direktör',
    department: 'Teknik',
    status: 'Aktif',
    avatar: 'AY',
    phone: '+90 555 123 4567',
    lastActive: '2023-12-25T14:30:00',
    joinDate: '2020-05-15T09:00:00',
    projects: ['Turkcell Dijital Konser', 'İstanbul Film Festivali'],
    bio: 'Teknik ekibin lideri olarak, etkinliklerimizin teknik altyapısını yönetmekteyim. 10 yıllık sektör deneyimim var.',
    skills: ['Video Switching', 'Işık Tasarımı', 'Teknik Yönetim', 'Ekip Koordinasyonu'],
    address: 'Kadıköy, İstanbul',
    emergencyContact: 'Ayşe Yılmaz (Eş) - +90 555 987 6543'
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    email: 'zeynep@skproduction.com',
    role: 'Medya Server Uzmanı',
    department: 'Medya',
    status: 'Aktif',
    avatar: 'ZK',
    phone: '+90 555 234 5678',
    lastActive: '2023-12-26T09:15:00',
    joinDate: '2021-03-10T10:30:00',
    projects: ['Vodafone Kurumsal Lansman', 'Mercedes Yeni Model Tanıtımı'],
    bio: 'Medya server sistemleri konusunda 7 yıllık deneyime sahibim. Watchout ve Disguise sistemlerinde uzmanlığım var.',
    skills: ['Disguise', 'Watchout', 'Resolume Arena', 'Content Management'],
    address: 'Beşiktaş, İstanbul'
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    email: 'mehmet@skproduction.com',
    role: 'Görüntü Yönetmeni',
    department: 'Görüntü',
    status: 'Aktif',
    avatar: 'MD',
    phone: '+90 555 345 6789',
    lastActive: '2023-12-25T16:45:00',
    joinDate: '2019-11-22T08:15:00',
    projects: ['TED Konferansı', 'Ulusal Müzik Ödülleri'],
    bio: 'Görüntü yönetmeni olarak çeşitli büyük ölçekli etkinliklerde görev aldım. Kamera ekibi koordinasyonu ve görüntü rejisi konularında deneyimliyim.',
    skills: ['Görüntü Rejisi', 'Kamera Yönetimi', 'Görüntü Mikseri', 'IMAG'],
    address: 'Şişli, İstanbul'
  },
  {
    id: '4',
    name: 'Ayşe Şahin',
    email: 'ayse@skproduction.com',
    role: 'Teknisyen',
    department: 'Teknik',
    status: 'Aktif',
    avatar: 'AŞ',
    phone: '+90 555 456 7890',
    lastActive: '2023-12-26T11:20:00',
    joinDate: '2022-01-15T14:00:00',
    projects: ['Teknoloji Zirvesi', 'Gaming Istanbul'],
    bio: 'Teknik kurulum ve sorun giderme konusunda 5 yıllık deneyime sahibim. LED ekran kurulumu ve video sistemleri konusunda uzmanım.',
    skills: ['LED Kurulum', 'Video Sistemleri', 'Teknik Destek', 'Kablolama'],
    address: 'Ataşehir, İstanbul'
  },
  {
    id: '5',
    name: 'Can Özkan',
    email: 'can@skproduction.com',
    role: 'Proje Yöneticisi',
    department: 'Yönetim',
    status: 'Aktif',
    avatar: 'CÖ',
    phone: '+90 555 567 8901',
    lastActive: '2023-12-26T10:30:00',
    joinDate: '2020-09-05T09:30:00',
    projects: ['Ulusal Müzik Ödülleri', 'Kurumsal İnovasyon Günleri', 'E-Spor Şampiyonası'],
    bio: 'Proje yönetimi konusunda 8 yıllık deneyimim var. Büyük ölçekli etkinlikler için planlama, koordinasyon ve müşteri ilişkileri konularında uzmanım.',
    skills: ['Proje Yönetimi', 'Bütçe Planlama', 'Ekip Koordinasyonu', 'Müşteri İlişkileri'],
    address: 'Levent, İstanbul',
    emergencyContact: 'Deniz Özkan (Kardeş) - +90 555 222 3344'
  },
  {
    id: '6',
    name: 'Elif Yıldız',
    email: 'elif@skproduction.com',
    role: 'Admin',
    department: 'Yönetim',
    status: 'Aktif',
    avatar: 'EY',
    phone: '+90 555 678 9012',
    lastActive: '2023-12-26T13:45:00',
    joinDate: '2018-06-12T11:15:00',
    projects: ['Tüm Projeler'],
    bio: 'Şirket yönetimi ve operasyonlarından sorumlu olarak görev yapmaktayım. Finansal planlama, insan kaynakları ve şirket stratejisi konularında 12 yıllık deneyimim bulunmaktadır.',
    skills: ['Şirket Yönetimi', 'Finansal Planlama', 'İnsan Kaynakları', 'Operasyon Yönetimi', 'Stratejik Planlama'],
    address: 'Etiler, İstanbul',
    emergencyContact: 'Ahmet Yıldız (Eş) - +90 555 111 2233'
  },
  {
    id: '7',
    name: 'Burak Aydın',
    email: 'burak@skproduction.com',
    role: 'Teknisyen',
    department: 'Teknik',
    status: 'Pasif',
    avatar: 'BA',
    phone: '+90 555 789 0123',
    lastActive: '2023-12-20T15:10:00',
    joinDate: '2021-11-08T10:00:00',
    projects: ['Mobil Dünya Kongresi', 'Yılsonu Kurumsal Etkinliği'],
    bio: 'Ses ve ışık sistemleri konusunda 6 yıllık deneyime sahibim. Teknik kurulum ve operasyon süreçlerinde uzmanım.',
    skills: ['Ses Sistemleri', 'Işık Sistemleri', 'Sahne Kurulumu'],
    address: 'Maltepe, İstanbul'
  }
];

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  // Form durumu
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    role: 'Teknisyen',
    department: 'Teknik',
    status: 'Aktif',
    phone: '',
    address: '',
    bio: '',
    skills: [],
    emergencyContact: ''
  });
  
  // Yetenek girişi
  const [skillInput, setSkillInput] = useState('');
  
  // İl/İlçe state
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  // Yükleme ve hata durumları
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Kullanıcı verilerini yükleme
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { getUserById } = await import('@/services/userService');
        const user = await getUserById(userId);
        
        if (user) {
          // Backend formatını frontend formatına dönüştür
          const role = mapBackendRoleToFrontend(user.role);
          const status = user.isActive ? 'Aktif' : 'Pasif';
          
          setFormData({
            name: user.name || '',
            email: user.email || '',
            role: role,
            department: (user as any).department || '',
            status: status,
            phone: (user as any).phone || '',
            address: (user as any).address || '',
            bio: (user as any).bio || '',
            skills: (user as any).skills || [],
            emergencyContact: (user as any).emergencyContact || '',
            password: '' // Şifre alanını boş bırak
          });
        } else {
          // Kullanıcı bulunamadığında hata durumunu ekleyebiliriz
          setErrors({
            general: 'Kullanıcı bulunamadı'
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setErrors({
          general: 'Kullanıcı verileri yüklenirken bir hata oluştu'
        });
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // Form değişikliği işleyicisi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Hataları temizle
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Yetenek ekleme
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };
  
  // Yetenek silme
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };
  
  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad alanı zorunludur';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.role) {
      newErrors.role = 'Rol seçimi zorunludur';
    }
    
    if (formData.phone && !/^\+90\s*([0-9]{3})\s*([0-9]{3})\s*([0-9]{2})\s*([0-9]{2})$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (10 haneli)';
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
    setSuccessMessage('');
    
    try {
      // API'ye gönderilecek veri - Backend formatına uygun
      // Adresi il ve ilçe ile birleştir
      const fullAddress = city && district 
        ? `${formData.address ? formData.address + ', ' : ''}${district}, ${city}`
        : formData.address;
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: fullAddress || undefined,
        role: mapFrontendRoleToBackend(formData.role) as 'ADMIN' | 'FIRMA_SAHIBI' | 'PROJE_YONETICISI' | 'DEPO_SORUMLUSU' | 'TEKNISYEN',
        isActive: formData.status === 'Aktif',
      };
      
      // Şifre sadece doldurulmuşsa ekle
      if (formData.password && formData.password.trim().length > 0) {
        if (formData.password.length < 6) {
          setErrors(prev => ({
            ...prev,
            password: 'Şifre en az 6 karakter olmalıdır'
          }));
          setSubmitting(false);
          return;
        }
        userData.password = formData.password;
      }
      
      await updateUser(userId, userData);
      setSuccessMessage('Kullanıcı başarıyla güncellendi! Kullanıcı listesine yönlendiriliyorsunuz...');
      
      // Başarılı mesajını gösterdikten sonra kullanıcı listesine yönlendir
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
      
    } catch (error: any) {
      console.error('Güncelleme hatası:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Kullanıcı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kullanıcı Düzenle</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Kullanıcı bilgilerini güncellemek için formu düzenleyin</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/users/view/${userId}`}>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              İptal
            </button>
          </Link>
        </div>
      </div>
      
      {/* Başarı mesajı */}
      {successMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Genel Hata Mesajı */}
      {errors.general && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
          {errors.general}
          <div className="mt-2">
            <Link href="/admin/users">
              <button className="text-red-700 dark:text-red-300 underline">
                Kullanıcı listesine dön
              </button>
            </Link>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : errors.general ? null : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad Soyad */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                  placeholder="Ad Soyad"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.name}</p>}
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
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                  placeholder="ornek@skproduction.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>}
              </div>
              
              {/* Telefon */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                <PhoneInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  error={errors.phone}
                  className="bg-gray-50 dark:bg-gray-900/50"
                />
              </div>
            </div>
          </div>
          
          {/* Adres Bilgileri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Adres Bilgileri</h2>
            <div className="space-y-6">
              {/* İl/İlçe */}
              <CityDistrictSelect
                cityValue={city}
                districtValue={district}
                onCityChange={(value) => {
                  setCity(value);
                  // İl değiştiğinde adresi güncelle
                  setFormData(prev => ({ 
                    ...prev, 
                    address: prev.address || '' 
                  }));
                }}
                onDistrictChange={(value) => {
                  setDistrict(value);
                  // İlçe değiştiğinde adresi güncelle
                  setFormData(prev => ({ 
                    ...prev, 
                    address: prev.address || '' 
                  }));
                }}
                cityLabel="İl"
                districtLabel="İlçe"
              />
              
              {/* Detaylı Adres */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Detaylı Adres
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  placeholder="İlçe, Şehir"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Rol ve Durum</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rol */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.role ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5`}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.role}</p>}
              </div>
              
              {/* Departman */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departman
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                >
                  <option value="">Seçiniz</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
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
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ek Bilgiler</h2>
            <div className="space-y-6">
              {/* Yetenekler */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yetenekler
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-l-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                    placeholder="Yeni yetenek ekle"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-r-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Ekle
                  </button>
                </div>
                
                {formData.skills && formData.skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
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
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Henüz yetenek eklenmemiş.</p>
                )}
              </div>
              
              {/* Biyografi */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hakkında / Biyografi
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  placeholder="Kullanıcı hakkında kısa bir açıklama"
                ></textarea>
              </div>
              
              {/* Acil Durum İletişim */}
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acil Durum İletişim
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  placeholder="Ad Soyad (İlişki) - Telefon"
                />
              </div>
            </div>
          </div>
          
          {/* Gönderme Hatası */}
          {errors.submit && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md">
              {errors.submit}
            </div>
          )}
          
          {/* Gönderme Butonları */}
          <div className="flex justify-end space-x-3">
            <Link href={`/admin/users/view/${userId}`}>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting || !!successMessage}
              className={`px-6 py-2 bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary transition-colors flex items-center ${(submitting || !!successMessage) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : !!successMessage ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 