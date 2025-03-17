'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Müşteri türü tanımlama
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

// Endüstri seçenekleri
const industryOptions = [
  'Tümü',
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

export default function ClientList() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  // Veri yükleme
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const response = await fetch('/api/admin/clients');
        // if (!response.ok) throw new Error('Müşteri verileri alınamadı');
        // const data = await response.json();
        // setClients(data);
        
        // Şimdilik örnek verileri kullanıyoruz
        setTimeout(() => {
          setClients(sampleClients);
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
  // Filtreleme
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesIndustry = selectedIndustry === 'Tümü' || client.industry === selectedIndustry;
    
    const matchesStatus = 
      selectedStatus === 'Tümü' || 
      (selectedStatus === 'Aktif' && client.status === 'Active') ||
      (selectedStatus === 'Pasif' && client.status === 'Inactive');
    
    return matchesSearch && matchesIndustry && matchesStatus;
  });
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Müşteri silme işlevi
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      // API entegrasyonu olduğunda burada backend'e istek gönderilecek
      // const response = await fetch(`/api/admin/clients/${clientToDelete}`, {
      //   method: 'DELETE',
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Müşteri silinirken bir hata oluştu');
      // }
      
      // Şimdilik örnek veriyi güncelliyoruz
      setClients(clients.filter(client => client.id !== clientToDelete));
      setShowDeleteModal(false);
      setClientToDelete(null);
      
    } catch (error) {
      console.error('Silme hatası:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve ekleme butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Müşteri Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Tüm müşterilerinizi yönetin ve takip edin</p>
        </div>
        <Link href="/admin/clients/add">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                placeholder="Müşteri adı, kişi veya iletişim bilgileri ara..."
              />
            </div>
          </div>
          
          {/* Endüstri filtresi */}
          <div>
            <label htmlFor="industry-filter" className="sr-only">Endüstri</label>
            <select
              id="industry-filter"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry === 'Tümü' ? 'Tüm Endüstriler' : industry}</option>
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
      
      {/* Müşteri Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Müşteri Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun müşteri bulunamadı.</p>
            {searchTerm || selectedIndustry !== 'Tümü' || selectedStatus !== 'Tümü' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedIndustry('Tümü');
                  setSelectedStatus('Tümü');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/clients/add">
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
                    Müşteri Adı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İletişim Kişisi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Endüstri
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proje Sayısı
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                          <span className="text-[#0066CC] dark:text-primary-light text-lg font-semibold">
                            {client.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(client.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{client.contactPerson}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{client.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{client.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'Active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {client.status === 'Active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {client.projectCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/clients/view/${client.id}`}>
                          <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                            Görüntüle
                          </button>
                        </Link>
                        <Link href={`/admin/clients/edit/${client.id}`}>
                          <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            Düzenle
                          </button>
                        </Link>
                        <button 
                          onClick={() => {
                            setClientToDelete(client.id);
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
                  setClientToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteClient}
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