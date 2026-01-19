'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import CommentsPanel from '@/components/admin/CommentsPanel';

// Görev, Kullanıcı ve Proje türleri
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
  notes?: string;
  attachments?: Attachment[];
}

interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  clientId?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
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
    updatedAt: '2023-10-15',
    notes: 'Kurulum başarıyla tamamlandı. Ekranlar test edildi ve çalışır durumda.',
    attachments: [
      {
        id: '1',
        name: 'kurulum_plani.pdf',
        type: 'pdf',
        url: '',
        uploadedAt: '2023-10-01'
      },
      {
        id: '2',
        name: 'ekran_gorselleri.jpg',
        type: 'image',
        url: '',
        uploadedAt: '2023-10-15'
      }
    ]
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
    updatedAt: '2023-11-10',
    notes: 'Montaj işlemleri devam ediyor. Müzik seçimi için öneriler bekleniyor.'
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
    updatedAt: '2023-12-07',
    notes: 'İnteraktif kiosk için dokunmatik ekran kodlaması devam ediyor. İçerik akışı tasarlandı.'
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
    updatedAt: '2023-12-20',
    notes: 'Toplantı yeri netleşince devam edilecek.'
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

export default function ViewTask() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Görev verilerini yükle
  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const { getTaskById } = await import('@/services/taskService');
        const taskData = await getTaskById(taskId);
        
        // Backend formatını frontend formatına dönüştür
        const formattedTask = {
          id: taskData._id || taskData.id || '',
          title: taskData.title,
          description: taskData.description || '',
          priority: (taskData.priority === 'LOW' ? 'Düşük' :
                   taskData.priority === 'MEDIUM' ? 'Orta' :
                   taskData.priority === 'HIGH' ? 'Yüksek' : 'Acil') as 'Düşük' | 'Orta' | 'Yüksek' | 'Acil',
          status: (taskData.status === 'TODO' ? 'Atandı' :
                 taskData.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                 taskData.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi') as 'Atandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi',
          dueDate: taskData.dueDate || '',
          assignedTo: typeof taskData.assignedTo === 'object' ? (taskData.assignedTo as any)._id || (taskData.assignedTo as any).id : taskData.assignedTo || '',
          relatedProject: typeof taskData.project === 'object' ? (taskData.project as any)._id || (taskData.project as any).id : taskData.project || '',
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: taskData.updatedAt || new Date().toISOString()
        };
        
        setTask(formattedTask);
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);
  
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-[#0066CC] dark:text-primary-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Görev Bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Aradığınız görev bulunamadı veya silinmiş olabilir.</p>
        <Link href="/admin/tasks">
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
            Görev Listesine Dön
          </button>
        </Link>
      </div>
    );
  }
  
  const assignedUser = findUserById(task.assignedTo);
  const relatedProject = findProjectById(task.relatedProject);
  const daysRemaining = calculateDaysRemaining(task.dueDate);
  const dueDateClass = getDueDateStatus(task.dueDate, task.status);

  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve eylem butonları */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/tasks" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{task.title}</h1>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/tasks/edit/${task.id}`}>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Düzenle
            </button>
          </Link>
          <Link href="/admin/tasks">
            <button className="px-4 py-2 bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Listeye Dön
            </button>
          </Link>
        </div>
      </div>
      
      {/* Sekme Menüsü */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Görev Detayları
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Notlar ve Ekler
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comments'
                ? 'border-[#0066CC] dark:border-primary-light text-[#0066CC] dark:text-primary-light'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Yorumlar
          </button>
        </nav>
      </div>
      
      {/* İçerik alanı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {activeTab === 'details' ? (
          <div className="p-6">
            {/* Görev bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol kolon - Görev detayları */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Görev Bilgileri</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Görev Açıklaması</h4>
                      <p className="text-gray-800 dark:text-white">{task.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Durum</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Öncelik</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Son Tarih</h4>
                      <p className={`text-gray-800 dark:text-white ${dueDateClass}`}>
                        {formatDate(task.dueDate)}
                        {task.status !== 'Tamamlandı' && task.status !== 'İptal Edildi' && (
                          <span className="text-sm ml-2">
                            {daysRemaining < 0 ? (
                              <span className="text-red-600 dark:text-red-400">{Math.abs(daysRemaining)} gün gecikmiş</span>
                            ) : daysRemaining === 0 ? (
                              <span className="text-orange-600 dark:text-orange-400">Bugün</span>
                            ) : (
                              <span>{daysRemaining} gün kaldı</span>
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Oluşturma Tarihi</h4>
                        <p className="text-gray-800 dark:text-white">{formatDate(task.createdAt)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Son Güncelleme</h4>
                        <p className="text-gray-800 dark:text-white">{formatDate(task.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sağ kolon - Atama bilgileri */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Atama Bilgileri</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Atanan Kişi</h4>
                      {assignedUser ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center">
                            <span className="text-[#0066CC] dark:text-primary-light text-base font-medium">
                              {assignedUser.avatar || assignedUser.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{assignedUser.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{assignedUser.role}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Atanmamış</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">İlgili Proje</h4>
                      {relatedProject ? (
                        <div>
                          <Link href={`/admin/projects/view/${relatedProject.id}`}>
                            <span className="text-[#0066CC] dark:text-primary-light hover:underline font-medium">{relatedProject.name}</span>
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{relatedProject.status}</p>
                          <Link href="/admin/projects">
                            <button className="mt-2 px-3 py-1 text-xs bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary text-white rounded-md transition-colors">
                              Proje Yönetimi
                            </button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Proje ile ilişkilendirilmemiş</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'notes' ? (
          <div className="p-6">
            {/* Notlar ve ekler sekmesi */}
            <div className="space-y-6">
              {/* Notlar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notlar</h3>
                
                {task.notes ? (
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md">
                    <p className="text-gray-800 dark:text-white whitespace-pre-line">{task.notes}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Bu görev için henüz not girilmemiş.</p>
                )}
              </div>
              
              {/* Ekler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ekler</h3>
                
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.attachments.map(attachment => (
                      <div key={attachment.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-[#0066CC]/10 dark:bg-primary-light/10 rounded-md flex items-center justify-center">
                          <svg className="h-6 w-6 text-[#0066CC] dark:text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                            <a 
                              href={attachment.url} 
                              download 
                              className="text-xs text-[#0066CC] dark:text-primary-light hover:underline"
                            >
                              İndir
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Yükleme Tarihi: {formatDate(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Bu görev için henüz ek dosya yüklenmemiş.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <CommentsPanel
              resourceType="TASK"
              resourceId={task.id}
              mentionableUsers={assignedUser ? [{ id: assignedUser.id, name: assignedUser.name }] : []}
            />
          </div>
        )}
      </div>
    </div>
  );
} 