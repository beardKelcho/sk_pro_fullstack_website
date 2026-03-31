'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';
import { Permission } from '@/config/permissionCore';
import ActiveFiltersBar from '@/components/admin/ActiveFiltersBar';

const ExportButton = dynamic(() => import('@/components/admin/ExportButton'), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      disabled
      className="px-4 py-2 rounded-md bg-green-600/70 text-white opacity-70"
    >
      Yukleniyor...
    </button>
  ),
});

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  status: 'Atandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi';
  dueDate: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: string;
  relatedProjectId?: string;
  relatedProjectName?: string;
  relatedProjectStatus?: string;
  createdAt: string;
  updatedAt: string;
}

type AssigneeOption = {
  id: string;
  name: string;
};

const PAGE_SIZE = 20;

const priorityColors = {
  'Düşük': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Orta': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'Yüksek': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  'Acil': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
};

const statusColors = {
  'Atandı': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'Devam Ediyor': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Tamamlandı': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'İptal Edildi': 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-400'
};

const mapBackendPriorityToFrontend = (priority?: string): Task['priority'] => {
  switch (priority) {
    case 'LOW':
      return 'Düşük';
    case 'HIGH':
      return 'Yüksek';
    case 'URGENT':
      return 'Acil';
    case 'MEDIUM':
    default:
      return 'Orta';
  }
};

const mapFrontendPriorityToBackend = (priority: string): string | undefined => {
  switch (priority) {
    case 'Düşük':
      return 'LOW';
    case 'Orta':
      return 'MEDIUM';
    case 'Yüksek':
      return 'HIGH';
    case 'Acil':
      return 'URGENT';
    default:
      return undefined;
  }
};

const mapBackendStatusToFrontend = (status?: string): Task['status'] => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'Devam Ediyor';
    case 'COMPLETED':
      return 'Tamamlandı';
    case 'CANCELLED':
      return 'İptal Edildi';
    case 'TODO':
    default:
      return 'Atandı';
  }
};

const mapFrontendStatusToBackend = (status: string): string | undefined => {
  switch (status) {
    case 'Atandı':
      return 'TODO';
    case 'Devam Ediyor':
      return 'IN_PROGRESS';
    case 'Tamamlandı':
      return 'COMPLETED';
    case 'İptal Edildi':
      return 'CANCELLED';
    default:
      return undefined;
  }
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<AssigneeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('Tümü');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tümü');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('Tümü');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedPriority, selectedStatus, selectedAssignee]);

  useEffect(() => {
    const loadAssignees = async () => {
      try {
        const { getAllUsers } = await import('@/services/userService');
        const response = await getAllUsers({ page: 1, limit: 1000 });
        const users = response.users || [];
        const formattedAssignees = users
          .filter((user: any) => Boolean(user?._id || user?.id))
          .map((user: any) => ({
            id: user._id || user.id,
            name: user.name || 'İsimsiz Kullanıcı',
          }));

        setAssigneeOptions(formattedAssignees);
      } catch (assigneeError) {
        logger.error('Atanan kullanıcılar yüklenemedi:', assigneeError);
      }
    };

    void loadAssignees();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const { getAllTasks } = await import('@/services/taskService');
        const response = await getAllTasks({
          page: currentPage,
          limit: PAGE_SIZE,
          search: debouncedSearchTerm || undefined,
          priority: selectedPriority !== 'Tümü' ? mapFrontendPriorityToBackend(selectedPriority) : undefined,
          status: selectedStatus !== 'Tümü' ? mapFrontendStatusToBackend(selectedStatus) : undefined,
          assignedTo: selectedAssignee !== 'Tümü' ? selectedAssignee : undefined,
        });
        const tasksList = response.tasks || response;
        const formattedTasks = Array.isArray(tasksList) ? tasksList.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          description: item.description || '',
          priority: mapBackendPriorityToFrontend(item.priority),
          status: mapBackendStatusToFrontend(item.status),
          dueDate: item.dueDate || '',
          assignedToId: typeof item.assignedTo === 'string' ? item.assignedTo : item.assignedTo?._id || item.assignedTo?.id || '',
          assignedToName: typeof item.assignedTo === 'object' && item.assignedTo ? item.assignedTo.name || '' : '',
          assignedToRole: typeof item.assignedTo === 'object' && item.assignedTo ? item.assignedTo.role || '' : '',
          relatedProjectId: typeof item.project === 'string' ? item.project : item.project?._id || item.project?.id || '',
          relatedProjectName: typeof item.project === 'object' && item.project ? item.project.name || '' : '',
          relatedProjectStatus: typeof item.project === 'object' && item.project ? item.project.status || '' : '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        })) : [];

        setTasks(formattedTasks);
        setTotalTasks(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } catch (taskError) {
        logger.error('Görev yükleme hatası:', taskError);
        setError('Görevler alınamadı.');
        toast.error('Görevler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    void fetchTasks();
  }, [currentPage, debouncedSearchTerm, selectedPriority, selectedStatus, selectedAssignee]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const shouldMoveToPreviousPage = tasks.length === 1 && currentPage > 1;
      const { deleteTask } = await import('@/services/taskService');
      await deleteTask(taskToDelete);

      if (shouldMoveToPreviousPage) {
        setCurrentPage(prev => prev - 1);
      } else {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      }

      setTotalTasks(prev => Math.max(prev - 1, 0));
      setShowDeleteModal(false);
      setTaskToDelete(null);
      toast.success('Görev başarıyla silindi');
    } catch (deleteError: any) {
      logger.error('Görev silme hatası:', deleteError);
      const errorMessage = deleteError?.response?.data?.message || deleteError?.message || 'Görev silinirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedPriority('Tümü');
    setSelectedStatus('Tümü');
    setSelectedAssignee('Tümü');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedPriority !== 'Tümü' ||
    selectedStatus !== 'Tümü' ||
    selectedAssignee !== 'Tümü';
  const activeFilterItems = [
    searchTerm ? { key: 'search', label: `Arama: ${searchTerm}`, onRemove: () => setSearchTerm('') } : null,
    selectedPriority !== 'Tümü' ? { key: 'priority', label: `Öncelik: ${selectedPriority}`, onRemove: () => setSelectedPriority('Tümü') } : null,
    selectedStatus !== 'Tümü' ? { key: 'status', label: `Durum: ${selectedStatus}`, onRemove: () => setSelectedStatus('Tümü') } : null,
    selectedAssignee !== 'Tümü'
      ? {
          key: 'assignee',
          label: `Atanan: ${assigneeOptions.find((user) => user.id === selectedAssignee)?.name || 'Seçili kullanıcı'}`,
          onRemove: () => setSelectedAssignee('Tümü'),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; onRemove: () => void }>;

  const calculateDaysRemaining = (dueDate: string): number => {
    if (!dueDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getDueDateStatus = (dueDate: string, status: Task['status']): string => {
    if (!dueDate || status === 'Tamamlandı' || status === 'İptal Edildi') return '';

    const daysRemaining = calculateDaysRemaining(dueDate);

    if (daysRemaining < 0) {
      return 'text-red-600 dark:text-red-400 font-medium';
    }
    if (daysRemaining <= 2) {
      return 'text-orange-600 dark:text-orange-400 font-medium';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Görev Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Ekip görevlerini takip edin ve atayın</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            endpoint="/export/tasks"
            filename="tasks-export.csv"
            label="Dışa Aktar"
          />
          <PermissionLink
            permission={Permission.TASK_CREATE}
            href="/admin/tasks/add"
            className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center"
            disabledMessage="Görev oluşturma yetkiniz bulunmamaktadır"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Yeni Görev Ekle
          </PermissionLink>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                placeholder="Görev başlığı veya açıklama ara..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="priority-filter" className="sr-only">Öncelik</label>
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Öncelikler</option>
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Acil">Acil</option>
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">Durum</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Atandı">Atandı</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignee-filter" className="sr-only">Atanan Kişi</label>
            <select
              id="assignee-filter"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Kullanıcılar</option>
              {assigneeOptions.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <ActiveFiltersBar
          filters={activeFilterItems}
          totalCount={totalTasks}
          visibleCount={tasks.length}
          itemLabel="görev"
          onClearAll={clearFilters}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Görev Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun görev bulunamadı.</p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <PermissionLink
                permission={Permission.TASK_CREATE}
                href="/admin/tasks/add"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
                disabledMessage="Görev oluşturma yetkiniz bulunmamaktadır"
              >
                Yeni Görev Ekle
              </PermissionLink>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Görev Başlığı
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum & Öncelik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Atanan Kişi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İlgili Proje
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Son Tarih
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map(task => {
                  const daysRemaining = calculateDaysRemaining(task.dueDate);
                  const dueDateClass = getDueDateStatus(task.dueDate, task.status);

                  return (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignedToName ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                              <span className="text-[#0066CC] dark:text-primary-light text-sm font-semibold">
                                {task.assignedToName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{task.assignedToName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{task.assignedToRole || 'Kullanıcı'}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Atanmamış</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {task.relatedProjectName ? (
                          <div>
                            <div className="font-medium">{task.relatedProjectName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{task.relatedProjectStatus || '-'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={dueDateClass}>
                          {formatDate(task.dueDate)}
                          {task.dueDate && task.status !== 'Tamamlandı' && task.status !== 'İptal Edildi' && (
                            <div className="text-xs mt-0.5">
                              {daysRemaining < 0 ? (
                                <span className="text-red-600 dark:text-red-400">{Math.abs(daysRemaining)} gün gecikmiş</span>
                              ) : daysRemaining === 0 ? (
                                <span className="text-orange-600 dark:text-orange-400">Bugün</span>
                              ) : (
                                <span>{daysRemaining} gün kaldı</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/tasks/view?id=${task.id}`}>
                            <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                              Görüntüle
                            </button>
                          </Link>
                          <PermissionLink
                            permission={Permission.TASK_UPDATE}
                            href={`/admin/tasks/edit?id=${task.id}`}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            disabledMessage="Görev düzenleme yetkiniz bulunmamaktadır"
                          >
                            Düzenle
                          </PermissionLink>
                          <PermissionButton
                            permission={Permission.TASK_DELETE}
                            onClick={() => {
                              setTaskToDelete(task.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            disabledMessage="Görev silme yetkiniz bulunmamaktadır"
                          >
                            Sil
                          </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Gösterilen: {tasks.length} / Toplam: {totalTasks}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Önceki
              </button>
              <span>Sayfa {currentPage} / {Math.max(totalPages, 1)}</span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="mb-4 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Görevi Sil</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
