'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllCustomers, deleteCustomer, getStatusLabel, industries, cities } from '@/services/customerService';
import type { Customer } from '@/services/customerService';

// Renk ayarları
const statusColors = {
  'Aktif': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'Pasif': 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-400'
};

export default function CustomerList() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtre state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Tümü');
  const [selectedCity, setSelectedCity] = useState<string>('Tümü');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tümü');
  
  // Modal state'leri
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Müşteri verilerini getir
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCustomers();
        setCustomers(data.clients || []);
      } catch (err) {
        setError('Müşteri kayıtları alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);
  
  // Filtreleme
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'Tümü' || customer.industry === selectedIndustry;
    const matchesCity = selectedCity === 'Tümü' || customer.city === selectedCity;
    const matchesStatus = selectedStatus === 'Tümü' || customer.status === selectedStatus;
    
    return matchesSearch && matchesIndustry && matchesCity && matchesStatus;
  });
  
  // Müşteri silme
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete);
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerToDelete));
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      setError('Müşteri kaydı silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve ekleme butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Müşteri Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Müşteri kayıtlarını yönetin</p>
        </div>
        <Link href="/admin/customers/add">
          <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Müşteri Ekle
          </button>
        </Link>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Arama */}
          <div className="md:col-span-2">
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
                placeholder="Firma adı, yetkili, e-posta veya telefon ara..."
              />
            </div>
          </div>
          
          {/* Sektör filtresi */}
          <div>
            <label htmlFor="industry-filter" className="sr-only">Sektör</label>
            <select
              id="industry-filter"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Sektörler</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          {/* Şehir filtresi */}
          <div>
            <label htmlFor="city-filter" className="sr-only">Şehir</label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Şehirler</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
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
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Aktif">Aktif</option>
              <option value="Pasif">Pasif</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Müşteri Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Müşteri Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun müşteri bulunamadı.</p>
            {searchTerm || selectedIndustry !== 'Tümü' || selectedCity !== 'Tümü' || selectedStatus !== 'Tümü' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndustry('Tümü');
                  setSelectedCity('Tümü');
                  setSelectedStatus('Tümü');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/customers/add">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                  Yeni Müşteri Ekle
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Firma Bilgileri
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sektör & Konum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vergi Bilgileri
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.companyName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.contactName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.industry || 'Belirtilmemiş'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.city || 'Belirtilmemiş'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.taxNumber || 'Belirtilmemiş'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{customer.taxOffice || 'Belirtilmemiş'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status as 'Aktif' | 'Pasif'] || ''}`}>
                        {getStatusLabel(customer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/customers/view/${customer.id}`}>
                          <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                            Görüntüle
                          </button>
                        </Link>
                        <Link href={`/admin/customers/edit/${customer.id}`}>
                          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            Düzenle
                          </button>
                        </Link>
                        <button 
                          onClick={() => {
                            setCustomerToDelete(customer.id || null);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Müşteriyi Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCustomerToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 