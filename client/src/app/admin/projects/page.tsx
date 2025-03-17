'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Proje durumları
type ProjectStatus = 'Planlama' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi';

// Müşteri tipi
interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
}

// Proje tipi
interface Project {
  id: string;
  name: string;
  description: string;
  customer: Customer;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget?: number;
  location: string;
  team: string[];
  equipment: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Örnek projeler
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Vodafone Kurumsal Etkinlik',
    description: 'Vodafone kurumsal müşteriler için büyük çaplı sunum ve tanıtım etkinliği',
    customer: {
      id: '101',
      name: 'Ahmet Yılmaz',
      companyName: 'Vodafone Türkiye',
      email: 'ahmet.yilmaz@vodafone.com',
      phone: '+90 532 123 4567'
    },
    startDate: '2023-12-10',
    endDate: '2023-12-12',
    status: 'Devam Ediyor',
    budget: 250000,
    location: 'Lütfi Kırdar Kongre Merkezi, İstanbul',
    team: ['1', '3', '5', '8'],
    equipment: ['1', '2', '4', '7'],
    notes: 'Ekstra LED ekranlar için hazırlık yapılacak. Yedek medya server götürülecek.',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-11-20T09:15:00Z'
  },
  {
    id: '2',
    name: 'TEB Yıl Sonu Değerlendirme',
    description: 'TEB yıl sonu değerlendirme ve 2024 hedefler toplantısı',
    customer: {
      id: '102',
      name: 'Zeynep Kaya',
      companyName: 'Türk Ekonomi Bankası',
      email: 'zeynep.kaya@teb.com',
      phone: '+90 533 765 4321'
    },
    startDate: '2023-12-20',
    endDate: '2023-12-20',
    status: 'Planlama',
    budget: 150000,
    location: 'TEB Genel Müdürlük, İstanbul',
    team: ['2', '4', '6'],
    equipment: ['3', '5', '8'],
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-15T16:45:00Z'
  },
  {
    id: '3',
    name: 'Mercedes-Benz Yeni Model Lansmanı',
    description: 'Yeni elektrikli SUV model lansmanı ve basın etkinliği',
    customer: {
      id: '103',
      name: 'Murat Öztürk',
      companyName: 'Mercedes-Benz Türkiye',
      email: 'murat.ozturk@mercedes-benz.com',
      phone: '+90 535 876 5432'
    },
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    status: 'Tamamlandı',
    budget: 350000,
    location: 'Tersane İstanbul',
    team: ['1', '2', '7', '9'],
    equipment: ['1', '2', '3', '6'],
    notes: 'Müşteri tüm ekipmanlardan çok memnun kaldı. Gelecek etkinlikleri de konuşmak istiyorlar.',
    createdAt: '2023-09-05T11:20:00Z',
    updatedAt: '2023-11-13T14:30:00Z'
  },
  {
    id: '4',
    name: 'Turkcell Teknoloji Zirvesi',
    description: '5G teknolojileri ve dijital dönüşüm zirvesi',
    customer: {
      id: '104',
      name: 'Elif Demir',
      companyName: 'Turkcell',
      email: 'elif.demir@turkcell.com',
      phone: '+90 536 987 6543'
    },
    startDate: '2024-01-15',
    endDate: '2024-01-17',
    status: 'Planlama',
    budget: 400000,
    location: 'Haliç Kongre Merkezi, İstanbul',
    team: ['3', '5', '8', '10'],
    equipment: ['1', '4', '9', '10'],
    notes: 'Teknik gereksinimler şubat başında belirlenecek. Müşteri AR deneyimi talep edebilir.',
    createdAt: '2023-10-25T09:45:00Z',
    updatedAt: '2023-11-05T13:10:00Z'
  },
  {
    id: '5',
    name: 'Koç Holding İnovasyon Günleri',
    description: 'Koç Holding şirketleri için inovasyon ve dijital dönüşüm etkinliği',
    customer: {
      id: '105',
      name: 'Mehmet Koç',
      companyName: 'Koç Holding',
      email: 'mehmet.koc@koc.com.tr',
      phone: '+90 537 234 5678'
    },
    startDate: '2023-09-05',
    endDate: '2023-09-08',
    status: 'Tamamlandı',
    budget: 500000,
    location: 'Koç Müzesi, İstanbul',
    team: ['1', '4', '7', '11'],
    equipment: ['2', '5', '7', '8'],
    notes: 'Çok başarılı geçti. Şubat 2024 için yeni etkinlik görüşülecek.',
    createdAt: '2023-06-15T08:30:00Z',
    updatedAt: '2023-09-10T16:20:00Z'
  }
];

// Durum renkleri
const statusColors: Record<ProjectStatus, string> = {
  'Planlama': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Devam Ediyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Tamamlandı': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'İptal Edildi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Proje verilerini getirme
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // API entegrasyonu burada yapılacak
        // const response = await fetch('/api/projects');
        // const data = await response.json();
        
        // Şimdilik örnek veriler
        await new Promise(resolve => setTimeout(resolve, 800));
        setProjects(sampleProjects);
      } catch (error) {
        console.error('Projeler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Silme modalını aç
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Projeyi sil
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // API entegrasyonu burada yapılacak
      // await fetch(`/api/projects/${projectToDelete.id}`, {
      //   method: 'DELETE',
      // });
      
      // Şimdilik yerel state güncelleme
      await new Promise(resolve => setTimeout(resolve, 600));
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Proje silinirken hata oluştu:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtreleme
  const filteredProjects = projects.filter(project => {
    // Arama filtresi
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !project.customer.companyName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Durum filtresi
    if (statusFilter && project.status !== statusFilter) {
      return false;
    }
    
    // Tarih filtresi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(project.startDate);
    
    if (dateFilter === 'upcoming' && startDate < today) {
      return false;
    }
    
    if (dateFilter === 'past' && startDate >= today) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="p-6">
      {/* Başlık ve Yeni Proje Ekleme Butonu */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projeler</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Tüm etkinlik ve organizasyon projelerini yönetin</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/admin/projects/add">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Yeni Proje Ekle
            </button>
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Arama */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arama
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Proje veya müşteri ara..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Durum Filtresi */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Tüm Durumlar</option>
              <option value="Planlama">Planlama</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>
          
          {/* Tarih Filtresi */}
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tarih
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as 'upcoming' | 'past' | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tüm Tarihler</option>
              <option value="upcoming">Yaklaşan Etkinlikler</option>
              <option value="past">Geçmiş Etkinlikler</option>
            </select>
          </div>
        </div>
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Projeler yükleniyor...</span>
          </div>
        </div>
      )}

      {/* Projeler Listesi */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Proje bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Filtreleri temizleyin veya yeni bir proje ekleyin.</p>
              <div className="mt-6">
                <Link href="/admin/projects/add">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Yeni Proje Ekle
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Proje
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Konum
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {project.description.length > 60 
                            ? `${project.description.substring(0, 60)}...` 
                            : project.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{project.customer.companyName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{project.customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(project.startDate)}</div>
                        {project.startDate !== project.endDate && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(project.endDate)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[project.status]}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="truncate max-w-xs">{project.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/projects/view/${project.id}`}>
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              Görüntüle
                            </button>
                          </Link>
                          <Link href={`/admin/projects/edit/${project.id}`}>
                            <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                              Düzenle
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(project)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
      )}

      {/* Silme Onay Modalı */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Projeyi Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong>{projectToDelete.name}</strong> projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm proje verileri silinecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Siliniyor...
                    </>
                  ) : "Evet, Sil"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 