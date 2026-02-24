'use client';
import { Suspense } from 'react';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FormError } from '@/types/form';
import { updateTask } from '@/services/taskService';
import logger from '@/utils/logger';
import { toast } from 'react-toastify';

// Kullanıcı arayüzü
interface User {
  id: string;
  name: string;
  role: string;
}

// Proje arayüzü
interface Project {
  id: string;
  name: string;
  status: string;
}

// Görev arayüzü
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
}

// Görev formu arayüzü
interface TaskForm {
  title: string;
  description: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Acil';
  status: 'Atandı' | 'Devam Ediyor' | 'Beklemede' | 'Tamamlandı' | 'İptal Edildi';
  dueDate: string;
  assignedTo: string;
  relatedProject?: string;
  notes?: string;
}

// Sample data kaldırıldı - Artık API'den çekiliyor

function EditTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = (searchParams.get('id') as string);
  
  // Form durumu
  const [formData, setFormData] = useState<TaskForm>({
    title: '',
    description: '',
    priority: 'Orta',
    status: 'Atandı',
    dueDate: '',
    assignedTo: '',
    relatedProject: '',
    notes: ''
  });
  
  // Kullanıcı ve projeler durumu
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Yükleme durumu
  const [loading, setLoading] = useState(true);
  
  // Hata durumu
  const [errors, setErrors] = useState<FormError<TaskForm>>({});
  
  // İşleniyor durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bildirim durumu
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
  // Görev verilerini yükle
  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const { getTaskById } = await import('@/services/taskService');
        const task = await getTaskById(taskId);
        
        // Backend formatını frontend formatına dönüştür
        const priority = task.priority === 'LOW' ? 'Düşük' :
                        task.priority === 'MEDIUM' ? 'Orta' :
                        task.priority === 'HIGH' ? 'Yüksek' : 'Acil';
        const status = task.status === 'TODO' ? 'Atandı' :
                       task.status === 'IN_PROGRESS' ? 'Devam Ediyor' :
                       task.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal Edildi';
        const assignedTo = typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo as any)?._id || (task.assignedTo as any)?.id || '';
        const relatedProject = typeof task.project === 'string' ? task.project : (task.project as any)?._id || (task.project as any)?.id || '';
        
        setFormData({
          title: task.title,
          description: task.description || '',
          priority,
          status,
          dueDate: task.dueDate || '',
          assignedTo,
          relatedProject,
          notes: ''
        });
        
        setLoading(false);
      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        setLoading(false);
      }
    };
    
    // Kullanıcı ve proje verilerini yükle
    const fetchData = async () => {
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const usersResponse = await fetch('/api/admin/users');
        // if (!usersResponse.ok) throw new Error('Kullanıcı verileri alınamadı');
        // const usersData = await usersResponse.json();
        // setUsers(usersData);
        
        // Kullanıcıları API'den çek
        const { getAllUsers } = await import('@/services/userService');
        const usersResponse = await getAllUsers();
        const usersList = usersResponse.users || [];
        setUsers(usersList.map((user: any) => ({
          id: user._id || user.id || '',
          name: user.name || '',
          role: user.role || ''
        })));
        setLoadingUsers(false);
        
        // Projeleri API'den çek
        const { getAllProjects } = await import('@/services/projectService');
        const projectsResponse = await getAllProjects();
        const projectsList = projectsResponse.projects || [];
        setProjects(projectsList.map((project: any) => ({
          id: project._id || project.id || '',
          name: project.name || '',
          status: project.status || ''
        })));
        setLoadingProjects(false);
        
      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        setLoadingUsers(false);
        setLoadingProjects(false);
      }
    };
    
    if (taskId) {
      fetchTaskData();
      fetchData();
    }
  }, [taskId, router]);
  
  // Form değişikliği işleyici
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // O alan için hatayı temizle
    if (errors[name as keyof TaskForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskForm, string>> = {};
    
    // Zorunlu alanlar
    if (!formData.title.trim()) {
      newErrors.title = 'Görev başlığı gereklidir';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Görev açıklaması gereklidir';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Son tarih gereklidir';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Görev bir kişiye atanmalıdır';
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
      // API'ye gönderilecek veri - Backend formatına uygun
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: (formData.status === 'Atandı' ? 'TODO' :
                formData.status === 'Devam Ediyor' ? 'IN_PROGRESS' :
                formData.status === 'Tamamlandı' ? 'COMPLETED' : 'CANCELLED') as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        priority: (formData.priority === 'Düşük' ? 'LOW' :
                 formData.priority === 'Orta' ? 'MEDIUM' :
                 formData.priority === 'Yüksek' ? 'HIGH' : 'URGENT') as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo,
        project: formData.relatedProject || undefined
      };
      await updateTask(taskId, taskData);
      toast.success('Görev başarıyla güncellendi');
      setShowSuccessNotification(true);
      setTimeout(() => {
        router.push('/admin/tasks');
      }, 2000);
    } catch (error: any) {
      logger.error('Görev güncelleme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Görev güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
      setErrors({ form: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
  
  return (
    <div className="space-y-6">
      {/* Üst bölüm - başlık ve geri butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/tasks" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Görev Düzenle</h1>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Görev bilgilerini güncelleyin</p>
        </div>
        <Link href={`/admin/tasks/view?id=${taskId}`}>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Görevi Görüntüle
          </button>
        </Link>
      </div>
      
      {/* Form kartı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Genel hata mesajı */}
            {errors.form && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400">
                <p>{errors.form}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol kolon - Temel Bilgiler */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Görev Bilgileri</h2>
                
                {/* Görev Başlığı */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görev Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`bg-gray-50 dark:bg-gray-900/50 border ${
                      errors.title 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                    } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                    placeholder="Görev başlığını girin"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
                </div>
                
                {/* Görev Açıklaması */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görev Açıklaması <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`bg-gray-50 dark:bg-gray-900/50 border ${
                      errors.description 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                    } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                    placeholder="Görevin detaylı açıklamasını girin"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
                </div>
                
                {/* Durum ve Öncelik */}
                <div className="grid grid-cols-2 gap-4">
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
                      <option value="Atandı">Atandı</option>
                      <option value="Devam Ediyor">Devam Ediyor</option>
                      <option value="Beklemede">Beklemede</option>
                      <option value="Tamamlandı">Tamamlandı</option>
                      <option value="İptal Edildi">İptal Edildi</option>
                    </select>
                  </div>
                  
                  {/* Öncelik */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Öncelik
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                    >
                      <option value="Düşük">Düşük</option>
                      <option value="Orta">Orta</option>
                      <option value="Yüksek">Yüksek</option>
                      <option value="Acil">Acil</option>
                    </select>
                  </div>
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
                    placeholder="Görev hakkında ek notlar"
                  />
                </div>
              </div>
              
              {/* Sağ kolon - Atama ve Tarih Bilgileri */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Atama Bilgileri</h2>
                
                {/* Atanan Kişi */}
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atanan Kişi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className={`bg-gray-50 dark:bg-gray-900/50 border ${
                      errors.assignedTo 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                    } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  >
                    <option value="">Kişi Seçin</option>
                    {loadingUsers ? (
                      <option disabled>Yükleniyor...</option>
                    ) : (
                      users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))
                    )}
                  </select>
                  {errors.assignedTo && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assignedTo}</p>}
                </div>
                
                {/* İlgili Proje */}
                <div>
                  <label htmlFor="relatedProject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    İlgili Proje
                  </label>
                  <select
                    id="relatedProject"
                    name="relatedProject"
                    value={formData.relatedProject || ''}
                    onChange={handleChange}
                    className="bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light block w-full p-2.5"
                  >
                    <option value="">Proje Seçin (Opsiyonel)</option>
                    {loadingProjects ? (
                      <option disabled>Yükleniyor...</option>
                    ) : (
                      projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.status})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                {/* Son Tarih */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Son Tarih <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`bg-gray-50 dark:bg-gray-900/50 border ${
                      errors.dueDate 
                        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-500 focus:border-red-500 dark:focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light'
                    } text-gray-900 dark:text-white text-sm rounded-lg block w-full p-2.5`}
                  />
                  {errors.dueDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Alt Kısmı - Gönderme Butonları */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Link href={`/admin/tasks/view?id=${taskId}`}>
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
              ) : 'Görevi Güncelle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Başarı bildirimi */}
      {showSuccessNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p className="font-medium">Görev başarıyla güncellendi!</p>
            <p className="text-sm">Görev detay sayfasına yönlendiriliyorsunuz...</p>
          </div>
        </div>
      )}
    </div>
  );
} 
export default function EditTask() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] dark:border-primary"></div>
      </div>
    }>
      <EditTaskContent />
    </Suspense>
  );
}
