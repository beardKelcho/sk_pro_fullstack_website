'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FormError } from '@/types/form';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import PhoneInput from '@/components/ui/PhoneInput';
import CityDistrictSelect from '@/components/ui/CityDistrictSelect';

// Müşteri türü (Local definition corresponding to API response)
interface Client {
  _id: string; // Backend uses _id
  id?: string;
  name: string;
  contactPerson: string; // Legacy field
  email: string;
  phone: string;
  address: string;
  industry: string;
  projectCount?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  notes?: string;
  contacts?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  }[];
}

interface Contact {
  name: string;
  phone: string;
  email: string;
  role: string;
}

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
  contacts: Contact[];
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
    industry: 'Etkinlik Organizasyonu',
    status: 'Active',
    notes: '',
    contacts: []
  });

  // Diğer durumlar
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FormError<ClientForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // İl/İlçe state (Adresi parse etmeye çalışacağız ama basitlik için manuel giriş de bırakabiliriz)
  // Şimdilik full adresi text area'da tutuyoruz.

  // Veri yükleme
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // API'den gerçek veri çekme
        const { getCustomerById } = await import('@/services/customerService');
        const data = await getCustomerById(clientId);

        // Data mapping
        // Backend returns `_id`, service map might be `id`? `customerService` returns `res.data.client || res.data`.
        // Let's assume data is the object.
        // It matches `Customer` interface.

        const contacts = data.contacts || [];

        setClient(data as any); // Cast to matches local Client interface if needed
        setFormData({
          name: data.name,
          contactPerson: data.contactPerson || '', // Assuming backend has this or map from first contact
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          industry: data.industry || 'Etkinlik Organizasyonu',
          status: (data.status as any) || 'Active',
          notes: data.notes || '',
          contacts: contacts
        });

        setLoading(false);

      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        setLoading(false);
        toast.error('Müşteri bilgileri yüklenemedi.');
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Handle Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof ClientForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Contact Handlers
  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '', email: '', role: '' }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientForm, string>> = {};

    // Zorunlu alanlar
    if (!formData.name.trim()) {
      newErrors.name = 'Müşteri adı gereklidir';
    }

    // Legacy support: contactPerson required? Maybe relax if contacts array is present?
    // Let's keep it required for now as backend might require it or not.
    if (!formData.contactPerson.trim()) {
      // If we treat contactPerson as "Primary Contact Name", keep it.
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
      const { updateCustomer } = await import('@/services/customerService');
      await updateCustomer(clientId, {
        name: formData.name,
        contactPerson: formData.contactPerson, // Make sure backend supports this or map it
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        industry: formData.industry,
        status: formData.status,
        notes: formData.notes,
        contacts: formData.contacts
      });

      toast.success('Müşteri başarıyla güncellendi');
      // 2 saniye sonra müşteri detay sayfasına yönlendir (veya listeye)
      setTimeout(() => {
        router.push('/admin/clients');
      }, 1500);

    } catch (error: any) {
      logger.error('Müşteri güncelleme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Müşteri güncellenirken bir hata oluştu.';
      setErrors({
        form: errorMessage
      });
      toast.error(errorMessage);
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Müşteri Düzenle
            </h1>
            <Link
              href="/admin/clients"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Müşteri Listesine Dön
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : client ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Genel hata mesajı */}
                {errors.form && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400">
                    <p>{errors.form}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Temel Bilgiler */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Temel Bilgiler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.name
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
                          className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.contactPerson
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
                          className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.email
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
                        <PhoneInput
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                          required
                          error={errors.phone}
                          className="bg-gray-50 dark:bg-gray-900/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ek Bilgiler */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ek Bilgiler</h2>
                    <div className="space-y-6">

                      {/* Detaylı Adres */}
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Detaylı Adres <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleChange}
                          className={`bg-gray-50 dark:bg-gray-900/50 border ${errors.address
                            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                            } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                          placeholder="Mahalle, Sokak, Bina No vb."
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

                      {/* Yetkili Kişiler */}
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Yetkili Kişiler</h2>
                          <button
                            type="button"
                            onClick={addContact}
                            className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            + Kişi Ekle
                          </button>
                        </div>

                        {formData.contacts.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Henüz eklenmiş yetkili kişi yok.</p>
                        )}

                        {formData.contacts.map((contact, index) => (
                          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-gray-50 dark:bg-gray-800/50 relative">
                            <button
                              type="button"
                              onClick={() => removeContact(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Kişiyi Sil"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ad Soyad</label>
                                <input
                                  type="text"
                                  placeholder="Ad Soyad"
                                  value={contact.name}
                                  onChange={e => handleContactChange(index, 'name', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Telefon</label>
                                <input
                                  type="text"
                                  placeholder="Telefon"
                                  value={contact.phone}
                                  onChange={e => handleContactChange(index, 'phone', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">E-posta</label>
                                <input
                                  type="text"
                                  placeholder="E-posta"
                                  value={contact.email}
                                  onChange={e => handleContactChange(index, 'email', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Görevi</label>
                                <input
                                  type="text"
                                  placeholder="Görevi (Opsiyonel)"
                                  value={contact.role}
                                  onChange={e => handleContactChange(index, 'role', e.target.value)}
                                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
                {/* Form Alt Kısmı - Gönderme Butonları */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 mt-6">
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
                    ) : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Müşteri bulunamadı
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Aradığınız müşteri kaydı bulunamadı veya silinmiş olabilir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}