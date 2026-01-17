'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProjects, deleteProject, updateProject } from '@/services/projectService';
import ExportMenu from '@/components/admin/ExportMenu';
import ImportModal from '@/components/admin/ImportModal';
import { Project, ProjectStatus, ProjectStatusDisplay, Client } from '@/types/project';
import logger from '@/utils/logger';
import { toast } from 'react-toastify';
import { getStoredUserPermissions, getStoredUserRole } from '@/utils/authStorage';
import { hasPermission, Permission } from '@/config/permissions';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';

// Backend enum'larını Türkçe string'e çeviren yardımcı fonksiyon
const getStatusDisplay = (status: ProjectStatus): ProjectStatusDisplay => {
  const statusMap: Record<ProjectStatus, ProjectStatusDisplay> = {
    'PLANNING': 'Onay Bekleyen', // legacy
    'PENDING_APPROVAL': 'Onay Bekleyen',
    'APPROVED': 'Onaylanan',
    'ACTIVE': 'Devam Ediyor',
    'ON_HOLD': 'Ertelendi',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal Edildi'
  };
  return statusMap[status] || 'Onay Bekleyen';
};

// Türkçe string'i backend enum'a çeviren yardımcı fonksiyon
const getStatusFromDisplay = (display: ProjectStatusDisplay): ProjectStatus => {
  const displayMap: Record<ProjectStatusDisplay, ProjectStatus> = {
    'Onay Bekleyen': 'PENDING_APPROVAL',
    'Onaylanan': 'APPROVED',
    'Devam Ediyor': 'ACTIVE',
    'Tamamlandı': 'COMPLETED',
    'Ertelendi': 'ON_HOLD',
    'İptal Edildi': 'CANCELLED'
  };
  return displayMap[display] || 'PENDING_APPROVAL';
};

// Görüntüleme için genişletilmiş Project tipi
interface ProjectDisplay extends Omit<Project, 'status' | 'client'> {
  status: ProjectStatusDisplay;
  customer: Client; // Görüntüleme için 'customer' alias'ı
}

// Durum renkleri (Türkçe görüntüleme için)
const statusColors: Record<ProjectStatusDisplay, string> = {
  'Onay Bekleyen': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Onaylanan': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Devam Ediyor': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Tamamlandı': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Ertelendi': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  'İptal Edildi': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectDisplay | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const canUpdateProject = hasPermission(userRole, Permission.PROJECT_UPDATE, userPermissions);

  // Proje verilerini getirme
  useEffect(() => {
    setUserRole(getStoredUserRole());
    setUserPermissions(getStoredUserPermissions());

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllProjects();
        // Backend'den gelen response formatına göre düzenle
        const projectsList = response.projects || response;
        // Backend formatını frontend formatına dönüştür
        const formattedProjects: ProjectDisplay[] = Array.isArray(projectsList) ? projectsList.map((item: any) => {
          const backendStatus = item.status as ProjectStatus;
          const clientData = typeof item.client === 'object' && item.client ? item.client : null;
          
          return {
            id: item._id || item.id || '',
            _id: item._id,
            name: item.name || '',
            description: item.description || '',
            customer: clientData ? {
              id: clientData._id || clientData.id || '',
              _id: clientData._id,
              name: clientData.name || '',
              companyName: clientData.companyName || clientData.name || '',
              email: clientData.email || '',
              phone: clientData.phone || '',
              address: clientData.address,
              industry: clientData.industry,
              city: clientData.city,
              status: clientData.status
            } : {
              id: '',
              name: '',
              companyName: '',
              email: '',
              phone: ''
            },
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            status: getStatusDisplay(backendStatus),
            budget: item.budget || 0,
            location: item.location || '',
            team: Array.isArray(item.team) ? item.team.map((t: any) => typeof t === 'string' ? t : (t._id || t.id || '')) : [],
            equipment: Array.isArray(item.equipment) ? item.equipment.map((e: any) => typeof e === 'string' ? e : (e._id || e.id || '')) : [],
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          };
        }) : [];
        setProjects(formattedProjects);
      } catch (err) {
        logger.error('Proje yükleme hatası:', err);
        setError('Projeler alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleQuickStatusChange = async (projectId: string, newDisplay: ProjectStatusDisplay) => {
    const old = projects.find((p) => p.id === projectId);
    if (!old) return;
    if (old.status === newDisplay) return;

    const nextBackendStatus = getStatusFromDisplay(newDisplay);

    // Optimistic UI
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newDisplay } : p)));
    setUpdatingStatusId(projectId);

    try {
      await updateProject(projectId, { status: nextBackendStatus } as any);
      toast.success('Proje durumu güncellendi');
    } catch (err: any) {
      logger.error('Proje durum quick update hatası:', err);
      // Revert
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: old.status } : p)));
      toast.error(err?.message || 'Proje durumu güncellenemedi');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Silme modalını aç
  const handleDeleteClick = (project: ProjectDisplay) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  // Projeyi sil
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
      toast.success('Proje başarıyla silindi');
    } catch (error: any) {
      logger.error('Proje silme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Proje silinirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
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
        <div className="mt-4 md:mt-0 flex gap-2">
          <ExportMenu 
            baseEndpoint="/api/export/projects"
            baseFilename="projects"
            label="Dışa Aktar"
          />
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
              <option value="Onay Bekleyen">Onay Bekleyen</option>
              <option value="Onaylanan">Onaylanan</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Ertelendi">Ertelendi</option>
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
                        {canUpdateProject ? (
                          <select
                            value={project.status}
                            disabled={updatingStatusId === project.id}
                            onChange={(e) => handleQuickStatusChange(project.id, e.target.value as ProjectStatusDisplay)}
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
                              statusColors[project.status]
                            } ${updatingStatusId === project.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            aria-label="Proje durumunu değiştir"
                          >
                            <option value="Onay Bekleyen">Onay Bekleyen</option>
                            <option value="Onaylanan">Onaylanan</option>
                            <option value="Devam Ediyor">Devam Ediyor</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                            <option value="Ertelendi">Ertelendi</option>
                            <option value="İptal Edildi">İptal Edildi</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[project.status]}`}>
                            {project.status}
                          </span>
                        )}
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
                          <PermissionLink
                            permission={Permission.PROJECT_UPDATE}
                            href={`/admin/projects/edit/${project.id}`}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            disabledMessage="Proje düzenleme yetkiniz bulunmamaktadır"
                          >
                            Düzenle
                          </PermissionLink>
                          <PermissionButton
                            permission={Permission.PROJECT_DELETE}
                            onClick={() => handleDeleteClick(project)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            disabledMessage="Proje silme yetkiniz bulunmamaktadır"
                          >
                            Sil
                          </PermissionButton>
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