'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateProject } from '@/services/projectService';
import inventoryService, { type InventoryItem as EquipmentItem } from '@/services/inventoryService';
import { getAllUsers } from '@/services/userService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { useQueryClient } from '@tanstack/react-query';
import { getStoredUserRole } from '@/utils/authStorage';
import { hasRole, Role } from '@/config/permissions';
import EquipmentSelector from '@/components/admin/projects/EquipmentSelector';

// Proje durumları için tip tanımlaması
type ProjectStatus = 'Onay Bekleyen' | 'Onaylanan' | 'Devam Ediyor' | 'Tamamlandı' | 'Ertelendi' | 'İptal Edildi';

interface TeamMember {
  id: string;
  name: string;
  role: string;
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

export default function AddProject() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProjectMutation = useCreateProject();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const canViewBudget = hasRole(userRole, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI);

  // Dinamik veri state'leri
  const [customers, setCustomers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // getAllTeamMembers ile doldurulacak

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
    status: 'Onay Bekleyen',
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);

  // Dinamik verileri çek
  useEffect(() => {
    setUserRole(getStoredUserRole());

    getAllCustomers().then(data => {
      const clients = data.clients || [];
      setCustomers(clients.map((client: any) => ({
        id: client._id || client.id || '',
        companyName: client.company || client.companyName || client.name || '',
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        contacts: client.contacts || [] // Added
      })));
    }).catch(error => {
      logger.error('Müşteriler yüklenirken hata:', error);
      toast.error('Müşteriler yüklenirken bir hata oluştu');
    });

    // Ekip üyelerini çek (tüm kullanıcılar)
    getAllUsers().then(data => {
      const users = data.users || [];
      setTeamMembers(users.map((user: any) => ({
        id: user._id || user.id || '',
        name: user.name || '',
        role: user.role || '',
        email: user.email || '',
        phone: user.phone || '',
      })));
    }).catch(error => {
      logger.error('Ekip üyeleri yüklenirken hata:', error);
      toast.error('Ekip üyeleri yüklenirken bir hata oluştu');
    });
  }, []);

  // Filtrelenmiş listeler
  const filteredTeamMembers = teamSearchTerm
    ? teamMembers.filter(member =>
      member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(teamSearchTerm.toLowerCase())
    )
    : teamMembers;

  const filteredCustomers = customerSearchTerm
    ? customers.filter(customer =>
      customer.companyName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
    )
    : customers;

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

  // Müşteri seçme
  const selectCustomer = (customer: any) => {
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
    // Müşteri selection mutlaka ID üzerinden yapılmalı (backend ObjectId bekliyor)
    if (!formData.customer || !/^[0-9a-fA-F]{24}$/.test(formData.customer)) {
      newErrors.customerName = 'Lütfen listeden geçerli bir müşteri seçin';
    }
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
      // API'ye gönderilecek veri - Backend formatına uygun
      // Tarihleri ISO8601 formatına çevir (YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss.sssZ)
      const startDateISO = formData.startDate ? new Date(formData.startDate + 'T00:00:00.000Z').toISOString() : undefined;
      const endDateISO = formData.endDate ? new Date(formData.endDate + 'T23:59:59.999Z').toISOString() : undefined;

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined, // Boşsa undefined gönder (validation optional)
        client: formData.customer, // Backend'de client olarak geçiyor
        startDate: startDateISO,
        endDate: endDateISO || undefined,
        location: formData.location.trim() || undefined,
        status: (
          formData.status === 'Onay Bekleyen' ? 'PENDING_APPROVAL' :
            formData.status === 'Onaylanan' ? 'APPROVED' :
              formData.status === 'Devam Ediyor' ? 'ACTIVE' :
                formData.status === 'Ertelendi' ? 'ON_HOLD' :
                  formData.status === 'Tamamlandı' ? 'COMPLETED' :
                    'CANCELLED'
        ) as 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED',
        team: formData.team && formData.team.length > 0 ? formData.team : [],
        equipment: formData.equipment && formData.equipment.length > 0 ? formData.equipment : [],
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        notes: formData.notes.trim() || undefined
        // Not: Budget field'ı backend model'inde henüz yok, ileride eklenebilir
      };
      await createProjectMutation.mutateAsync(projectData as any);

      // Dashboard ve proje cache'lerini invalidate et
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast.success('Proje başarıyla eklendi!');
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/projects');
      }, 2000);
    } catch (error: any) {
      logger.error('Proje ekleme hatası:', error);

      // Validation hatalarını daha detaylı göster
      let errorMessage = 'Proje eklenirken bir hata oluştu. Lütfen tekrar deneyin.';

      if (error?.response?.status === 400) {
        const errorData = error?.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          // Validation hatalarını birleştir
          const validationErrors = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
          errorMessage = `Validasyon hatası: ${validationErrors}`;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
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
                    const value = e.target.value;
                    // Kullanıcı yazmaya başlarsa seçili müşteri id'sini sıfırla (aksi halde backend'e yanlış id gidebilir)
                    setFormData(prev => ({
                      ...prev,
                      customerName: value,
                      customer: '',
                      contactPerson: '',
                      contactEmail: '',
                      contactPhone: '',
                    }));
                    setCustomerSearchTerm(value);
                    setShowCustomerList(true);
                    if (errors.customerName) {
                      setErrors(prev => ({ ...prev, customerName: '' }));
                    }
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
                          onClick={() => {
                            if (!customer.id || !/^[0-9a-fA-F]{24}$/.test(customer.id)) return;
                            selectCustomer(customer);
                          }}
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

              {/* Contact Selection Dropdown */}
              {customers.find(c => c.id === formData.customer)?.contacts && customers.find(c => c.id === formData.customer).contacts.length > 0 && (
                <div className="mb-2">
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm dark:bg-gray-700 dark:text-white"
                    onChange={(e) => {
                      const selectedContact = customers.find(c => c.id === formData.customer)?.contacts[e.target.value];
                      if (selectedContact) {
                        setFormData(prev => ({
                          ...prev,
                          contactPerson: selectedContact.name,
                          contactEmail: selectedContact.email,
                          contactPhone: selectedContact.phone
                        }));
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Kayıtlı kişilerden seç...</option>
                    {customers.find(c => c.id === formData.customer).contacts.map((contact: any, index: number) => (
                      <option key={index} value={index}>{contact.name} - {contact.role}</option>
                    ))}
                  </select>
                </div>
              )}

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

            {/* Durum */}
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
                <option value="Onay Bekleyen">Onay Bekleyen</option>
                <option value="Onaylanan">Onaylanan</option>
                <option value="Devam Ediyor">Devam Ediyor</option>
                <option value="Tamamlandı">Tamamlandı</option>
                <option value="Ertelendi">Ertelendi</option>
                <option value="İptal Edildi">İptal Edildi</option>
              </select>
            </div>

            {canViewBudget && (
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
            )}

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
                      const member = teamMembers.find(m => m.id === memberId);
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

            {/* Ekipman - Smart Selector */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ekipman & Stok
              </label>
              <EquipmentSelector
                inventoryService.getItems({page: 1, limit: 1000 }), selectedEquipment={formData.equipment}
              onSelectionChange={(ids) => setFormData(prev => ({ ...prev, equipment: ids }))}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Projeye atamak istediğiniz ekipmanları seçin veya QR kod ile ekleyin.
              </p>
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