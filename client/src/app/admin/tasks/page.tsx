'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllTasks, deleteTask } from '@/services/taskService';
import ExportButton from '@/components/admin/ExportButton';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionLink from '@/components/common/PermissionLink';
import { Permission } from '@/config/permissions';

// Görev türü tanımlama
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  status: 'Atandı' | 'Devam Ediyor' | 'Beklemede' | 'Tamamlandı' | 'İptal Edildi';
  dueDate: string;
  assignedTo: string;
  relatedProject?: string;
  createdAt: string;
  updatedAt: string;
}

// Kullanıcı türü tanımlama
interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

// Proje türü tanımlama
interface Project {
  id: string;
  name: string;
  status: string;
}

// Örnek kullanıcı verileri
const sampleUsers: User[] = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Teknik Direktör', avatar: 'AY' },
  { id: '2', name: 'Zeynep Kaya', role: 'Medya Server Uzmanı', avatar: 'ZK' },
  { id: '3', name: 'Mehmet Demir', role: 'Görüntü Yönetmeni', avatar: 'MD' },
  { id: '4', name: 'Ayşe Şahin', role: 'Teknisyen', avatar: 'AŞ' },
  { id: '5', name: 'Can Özkan', role: 'Proje Yöneticisi', avatar: 'CÖ' }
];

// Örnek proje verileri
const sampleProjects: Project[] = [
  { id: '1', name: 'TechCon 2023 Lansman Etkinliği', status: 'Tamamlandı' },
  { id: '2', name: 'Kurumsal Tanıtım Filmi', status: 'Devam Ediyor' },
  { id: '3', name: 'Yıllık Bayi Toplantısı', status: 'Planlanıyor' },
  { id: '4', name: 'Festival Organizasyonu', status: 'Devam Ediyor' },
  { id: '5', name: 'Müze Multimedya Kurulumu', status: 'Planlanıyor' }
];

// Örnek görev verileri
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'LED Ekran Kurulumu',
    description: 'TechCon etkinliği için ana salona LED ekranların kurulması ve ayarlanması',
    priority: 'Yüksek',
    status: 'Tamamlandı',
    dueDate: '2023-10-15',
    assignedTo: '2',
    relatedProject: '1',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-15'
  },
  {
    id: '2',
    title: 'Video İçerik Hazırlama',
    description: 'Kurumsal tanıtım filmi için video içeriğinin düzenlenmesi ve efektlerin eklenmesi',
    priority: 'Orta',
    status: 'Devam Ediyor',
    dueDate: '2023-11-20',
    assignedTo: '3',
    relatedProject: '2',
    createdAt: '2023-11-01',
    updatedAt: '2023-11-10'
  },
  {
    id: '3',
    title: 'Ses Sistemi Testi',
    description: 'Festival için kurulacak ses sisteminin test edilmesi ve kalibrasyonu',
    priority: 'Yüksek',
    status: 'Atandı',
    dueDate: '2023-12-10',
    assignedTo: '4',
    relatedProject: '4',
    createdAt: '2023-12-01',
    updatedAt: '2023-12-01'
  },
  {
    id: '4',
    title: 'Medya Server Programlama',
    description: 'Müze için interaktif medya içeriğinin programlanması',
    priority: 'Acil',
    status: 'Devam Ediyor',
    dueDate: '2023-12-15',
    assignedTo: '2',
    relatedProject: '5',
    createdAt: '2023-12-05',
    updatedAt: '2023-12-07'
  },
  {
    id: '5',
    title: 'Teknik Plan Hazırlama',
    description: 'Bayi toplantısı için teknik gereksinimlerin planlanması',
    priority: 'Düşük',
    status: 'Beklemede',
    dueDate: '2024-01-15',
    assignedTo: '1',
    relatedProject: '3',
    createdAt: '2023-12-20',
    updatedAt: '2023-12-20'
  },
  {
    id: '6',
    title: 'Ekipman Bakımı',
    description: 'Stüdyo ekipmanlarının düzenli bakımının yapılması',
    priority: 'Orta',
    status: 'Tamamlandı',
    dueDate: '2023-11-30',
    assignedTo: '4',
    relatedProject: undefined,
    createdAt: '2023-11-25',
    updatedAt: '2023-11-30'
  },
  {
    id: '7',
    title: 'Kablolama İşleri',
    description: 'Festival alanında kamera ve ışık sistemleri için kablolama yapılması',
    priority: 'Yüksek',
    status: 'Atandı',
    dueDate: '2023-12-17',
    assignedTo: '3',
    relatedProject: '4',
    createdAt: '2023-12-10',
    updatedAt: '2023-12-10'
  }
];

// Renk ayarları
const priorityColors = {
  'Düşük': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Orta': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'Yüksek': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
  'Acil': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
};

const statusColors = {
  'Atandı': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
  'Devam Ediyor': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'Beklemede': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'Tamamlandı': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'İptal Edildi': 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-400'
};

export default function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('Tümü');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tümü');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('Tümü');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Görev verilerini getirme
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllTasks();
        // Backend'den gelen response formatına göre düzenle
        const tasksList = response.tasks || response;
        // Backend formatını frontend formatına dönüştür
        const formattedTasks = Array.isArray(tasksList) ? tasksList.map((item: any) => ({
          id: item._id || item.id,
          title: item.title,
          description: item.description || '',
          priority: (item.priority === 'LOW' ? 'Düşük' :
                   item.priority === 'MEDIUM' ? 'Orta' :
                   item.priority === 'HIGH' ? 'Yüksek' : 'Acil') as 'Düşük' | 'Orta' | 'Yüksek' | 'Acil',
          status: (item.status === 'TODO' ? 'Atandı' :
                 item.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                 item.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi') as 'Atandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi',
          dueDate: item.dueDate || '',
          assignedTo: typeof item.assignedTo === 'string' ? item.assignedTo : item.assignedTo?._id || item.assignedTo?.id || '',
          relatedProject: typeof item.project === 'string' ? item.project : item.project?._id || item.project?.id || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        })) : [];
        setTasks(formattedTasks);
      } catch (err) {
        logger.error('Görev yükleme hatası:', err);
        setError('Görevler alınamadı.');
        toast.error('Görevler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);
  
  // Kullanıcı bilgisini bul
  const findUserById = (userId: string): User | undefined => {
    return sampleUsers.find(user => user.id === userId);
  };
  
  // Proje bilgisini bul
  const findProjectById = (projectId?: string): Project | undefined => {
    if (!projectId) return undefined;
    return sampleProjects.find(project => project.id === projectId);
  };
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Filtreleme
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = selectedPriority === 'Tümü' || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'Tümü' || task.status === selectedStatus;
    
    const matchesAssignee = 
      selectedAssignee === 'Tümü' || 
      task.assignedTo === selectedAssignee;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesAssignee;
  });
  
  // Görev silme işlevi
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete));
      setShowDeleteModal(false);
      setTaskToDelete(null);
      toast.success('Görev başarıyla silindi');
    } catch (error: any) {
      logger.error('Görev silme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Görev silinirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Günleri hesaplama fonksiyonu
  const calculateDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const timeDiff = due.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  // Son teslim tarihine göre durum belirleme
  const getDueDateStatus = (dueDate: string, status: string): string => {
    if (status === 'Tamamlandı' || status === 'İptal Edildi') return '';
    
    const daysRemaining = calculateDaysRemaining(dueDate);
    
    if (daysRemaining < 0) {
      return 'text-red-600 dark:text-red-400 font-medium';
    } else if (daysRemaining <= 2) {
      return 'text-orange-600 dark:text-orange-400 font-medium';
    } else {
      return '';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve ekleme butonu */}
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
          <Link href="/admin/tasks/add">
            <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Yeni Görev Ekle
            </button>
          </Link>
        </div>
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
                placeholder="Görev başlığı veya açıklama ara..."
              />
            </div>
          </div>
          
          {/* Öncelik filtresi */}
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
              <option value="Atandı">Atandı</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Beklemede">Beklemede</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal Edildi">İptal Edildi</option>
            </select>
          </div>
          
          {/* Atanan kişi filtresi */}
          <div>
            <label htmlFor="assignee-filter" className="sr-only">Atanan Kişi</label>
            <select
              id="assignee-filter"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
            >
              <option value="Tümü">Tüm Kullanıcılar</option>
              {sampleUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Görev Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Görev Bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Arama kriterlerinize uygun görev bulunamadı.</p>
            {searchTerm || selectedPriority !== 'Tümü' || selectedStatus !== 'Tümü' || selectedAssignee !== 'Tümü' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPriority('Tümü');
                  setSelectedStatus('Tümü');
                  setSelectedAssignee('Tümü');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none"
              >
                Filtreleri Temizle
              </button>
            ) : (
              <Link href="/admin/tasks/add">
                <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
                  Yeni Görev Ekle
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
                {filteredTasks.map(task => {
                  const user = findUserById(task.assignedTo);
                  const project = findProjectById(task.relatedProject);
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
                        {user ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                              <span className="text-[#0066CC] dark:text-primary-light text-sm font-semibold">
                                {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Atanmamış</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {project ? (
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{project.status}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={dueDateClass}>
                          {formatDate(task.dueDate)}
                          {task.status !== 'Tamamlandı' && task.status !== 'İptal Edildi' && (
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
                          <Link href={`/admin/tasks/view/${task.id}`}>
                            <button className="text-[#0066CC] dark:text-primary-light hover:text-[#0055AA] dark:hover:text-primary-light/80">
                              Görüntüle
                            </button>
                          </Link>
                          <PermissionLink
                            permission={Permission.TASK_UPDATE}
                            href={`/admin/tasks/edit/${task.id}`}
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
      </div>
      
      {/* Silme onay modalı */}
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