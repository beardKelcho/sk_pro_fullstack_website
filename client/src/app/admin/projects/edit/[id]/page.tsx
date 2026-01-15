'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ProjectStatus } from '@/types/project';
import { getProjectById, updateProject } from '@/services/projectService';
import { getAllCustomers, type Customer } from '@/services/customerService';
import { getAllUsers, getRoleLabel, type User } from '@/services/userService';
import { getAllEquipment, type Equipment as EquipmentItem } from '@/services/equipmentService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { getStoredUserRole } from '@/utils/authStorage';
import { hasRole, Role } from '@/config/permissions';

// Form verileri için arayüz
interface FormData {
  id: string;
  name: string;
  description: string;
  customer: string;
  startDate: string;
  endDate: string;
  location: string;
  status: ProjectStatus;
  budget: number;
  team: string[];
  equipment: string[];
  notes: string;
}

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  'PLANNING': 'Onay Bekleyen', // legacy (dropdown'da gösterilmeyecek)
  'PENDING_APPROVAL': 'Onay Bekleyen',
  'APPROVED': 'Onaylanan',
  'ACTIVE': 'Devam Ediyor',
  'ON_HOLD': 'Ertelendi',
  'COMPLETED': 'Tamamlandı',
  'CANCELLED': 'İptal Edildi'
};

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
};

const toIsoUtcMidnight = (dateInput: string) => `${dateInput}T00:00:00.000Z`;


export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [userRole, setUserRole] = useState<string>('');
  const canViewBudget = hasRole(userRole, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI);
  
  // Form state'leri
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    description: '',
    customer: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'PENDING_APPROVAL' as ProjectStatus,
    budget: 0,
    team: [],
    equipment: [],
    notes: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // State'ler - takım üyeleri ve ekipman seçimi için
  const [teamCheckboxes, setTeamCheckboxes] = useState<{ [key: string]: boolean }>({});
  const [equipmentCheckboxes, setEquipmentCheckboxes] = useState<{ [key: string]: boolean }>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);

  // Proje verilerini yükle
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        setUserRole(getStoredUserRole());

        const [project, customerRes, userRes, equipmentRes] = await Promise.all([
          getProjectById(projectId),
          getAllCustomers({ page: 1, limit: 1000 }),
          getAllUsers({ page: 1, limit: 1000 }),
          getAllEquipment({ page: 1, limit: 1000 }),
        ]);
        setCustomers(customerRes.clients || []);
        setUsers(userRes.users || []);
        setEquipmentList(equipmentRes.equipment || []);
        
        // Backend formatını frontend formatına dönüştür
        const clientId = typeof project.client === 'string' ? project.client : (project.client as any)?._id || (project.client as any)?.id || '';
        // Legacy normalize: PLANNING -> PENDING_APPROVAL (UI'da PLANNING gösterme)
        const status = (project.status === 'PLANNING' ? 'PENDING_APPROVAL' : project.status) as ProjectStatus;
        const teamIds = Array.isArray(project.team) ? project.team.map((t: any) => typeof t === 'string' ? t : t._id || t.id) : [];
        const equipmentIds = Array.isArray(project.equipment) ? project.equipment.map((e: any) => typeof e === 'string' ? e : e._id || e.id) : [];
        
        // Form verilerini ayarla
        setFormData({
          id: project._id || project.id || '',
          name: project.name,
          description: project.description || '',
          customer: clientId,
          startDate: toDateInputValue(project.startDate),
          endDate: toDateInputValue(project.endDate || ''),
          location: project.location || '',
          status: status as ProjectStatus,
          budget: project.budget || 0,
          team: teamIds,
          equipment: equipmentIds,
          notes: project.notes || ''
        });
        
        // Ekip ve ekipman checkbox'larını mevcut verilerle doldur
        const teamStates: { [key: string]: boolean } = {};
        (userRes.users || []).forEach((u: User) => {
          const uid = (u._id || u.id || '').toString();
          if (!uid) return;
          teamStates[uid] = teamIds.includes(uid);
        });
        setTeamCheckboxes(teamStates);
        
        const equipmentStates: { [key: string]: boolean } = {};
        (equipmentRes.equipment || []).forEach((eq: EquipmentItem) => {
          const eid = (eq._id || eq.id || '').toString();
          if (!eid) return;
          equipmentStates[eid] = equipmentIds.includes(eid);
        });
        setEquipmentCheckboxes(equipmentStates);
        
        // Yüklemeyi tamamla
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        setError('Proje bilgileri yüklenirken bir hata oluştu');
        setNotFound(true);
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  // Form girişlerini işleyecek fonksiyonlar
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    // Bütçe için sayısal değer dönüşümü
    if (name === 'budget') {
      processedValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  // Ekip üyelerini toggle
  const handleTeamToggle = (id: string) => {
    // Checkbox durumunu değiştir
    setTeamCheckboxes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Form state'ini güncelle
    setFormData(prev => {
      const newTeam = prev.team.includes(id)
        ? prev.team.filter(memberId => memberId !== id)
        : [...prev.team, id];
      
      return { ...prev, team: newTeam };
    });
  };
  
  // Ekipmanları toggle
  const handleEquipmentToggle = (id: string) => {
    // Checkbox durumunu değiştir
    setEquipmentCheckboxes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    
    // Form state'ini güncelle
    setFormData(prev => {
      const newEquipment = prev.equipment.includes(id)
        ? prev.equipment.filter(equipId => equipId !== id)
        : [...prev.equipment, id];
      
      return { ...prev, equipment: newEquipment };
    });
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Proje adı gereklidir');
      return false;
    }
    
    if (!formData.customer) {
      setError('Müşteri seçmelisiniz');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Başlangıç tarihi gereklidir');
      return false;
    }
    
    if (!formData.endDate) {
      setError('Bitiş tarihi gereklidir');
      return false;
    }
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('Bitiş tarihi, başlangıç tarihinden önce olamaz');
      return false;
    }
    
    if (!formData.location.trim()) {
      setError('Lokasyon gereklidir');
      return false;
    }

    return true;
  };
  
  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form doğrulama
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      // API'ye gönderilecek veri - Backend formatına uygun
      const projectData = {
        name: formData.name,
        description: formData.description,
        client: formData.customer, // Backend'de client olarak geçiyor
        startDate: toIsoUtcMidnight(formData.startDate),
        endDate: formData.endDate ? toIsoUtcMidnight(formData.endDate) : undefined,
        location: formData.location,
        status: formData.status,
        team: formData.team || [],
        equipment: formData.equipment || [],
        notes: formData.notes
      };
      await updateProject(projectId, projectData as any);
      toast.success('Proje başarıyla güncellendi');
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/projects');
      }, 2000);
    } catch (error: any) {
      logger.error('Proje güncelleme hatası:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Proje güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Para birimini formatlama
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Yükleniyor durumu
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
  
  // Proje bulunamadı durumu
  if (notFound) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Proje Bulunamadı</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Düzenlemek istediğiniz proje bulunamadı veya erişim izniniz yok.</p>
        <div className="mt-6">
          <Link href="/admin/projects">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary focus:outline-none">
              Proje Listesine Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/projects" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Proje Düzenle</h1>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Proje bilgilerini güncelle</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        {/* Temel Bilgiler */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Temel Bilgiler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proje Adı */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Proje adını girin"
                required
              />
            </div>
            
            {/* Müşteri */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Müşteri <span className="text-red-500">*</span>
              </label>
              <select
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Müşteri seçin</option>
                {customers.map((c) => {
                  const id = (c._id || c.id || '').toString();
                  if (!id) return null;
                  const label = c.companyName || c.name;
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* Başlangıç Tarihi */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Başlangıç Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            {/* Bitiş Tarihi */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bitiş Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                required
              />
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Etkinlik lokasyonunu girin"
                required
              />
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
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                required
              >
                {Object.entries(statusNames).filter(([value]) => value !== 'PLANNING').map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Bütçe */}
            {canViewBudget && (
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bütçe (TL)
                </label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget === 0 ? '' : formData.budget.toString()}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                  placeholder="Proje bütçesini girin"
                />
                {formData.budget > 0 && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(formData.budget)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ekip ve Ekipman Bölümü */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ekip ve Ekipman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ekip Üyeleri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ekip Üyeleri
              </label>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ekip üyesi bulunamadı</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((u) => {
                      const uid = (u._id || u.id || '').toString();
                      if (!uid) return null;
                      return (
                      <div key={uid} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`team-${uid}`}
                            type="checkbox"
                            checked={teamCheckboxes[uid] || false}
                            onChange={() => handleTeamToggle(uid)}
                            className="focus:ring-[#0066CC] dark:focus:ring-primary-light h-4 w-4 text-[#0066CC] dark:text-primary-light border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`team-${uid}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {u.name}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">{getRoleLabel(u.role)}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Seçilen Ekip Üyeleri: {formData.team.length}
              </p>
            </div>
            
            {/* Ekipmanlar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ekipmanlar
              </label>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {equipmentList.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ekipman bulunamadı</p>
                ) : (
                  <div className="space-y-2">
                    {equipmentList.map((eq) => {
                      const eid = (eq._id || eq.id || '').toString();
                      if (!eid) return null;
                      const isSelected = formData.equipment.includes(eid);
                      const backendStatus = (eq as any).status as string | undefined;
                      const isDisabled = !isSelected && backendStatus !== undefined && backendStatus !== 'AVAILABLE';
                      return (
                      <div key={eid} className={`flex items-start ${isDisabled ? 'opacity-60' : ''}`}>
                        <div className="flex items-center h-5">
                          <input
                            id={`equipment-${eid}`}
                            type="checkbox"
                            checked={equipmentCheckboxes[eid] || false}
                            onChange={() => {
                              if (isDisabled) return;
                              handleEquipmentToggle(eid);
                            }}
                            className="focus:ring-[#0066CC] dark:focus:ring-primary-light h-4 w-4 text-[#0066CC] dark:text-primary-light border-gray-300 dark:border-gray-600 rounded"
                            disabled={isDisabled}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`equipment-${eid}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {eq.name}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">{eq.type}</p>
                          {isDisabled && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                              Kullanımda/Bakımda olduğu için atanamaz
                            </p>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Seçilen Ekipmanlar: {formData.equipment.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Açıklama ve Notlar */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Açıklama ve Notlar</h3>
          <div className="space-y-6">
            {/* Proje Açıklaması */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proje Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Proje hakkında genel bilgiler"
              />
            </div>
            
            {/* Notlar */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Önemli notlar, hatırlatmalar veya detaylar"
              />
            </div>
          </div>
        </div>
        
        {/* Form Düğmeleri */}
        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Hata Mesajı */}
          {error && (
            <div className="flex-grow">
              <p className="text-sm text-red-600 dark:text-red-400">
                <span className="font-medium">Hata:</span> {error}
              </p>
            </div>
          )}
          
          {/* Başarı Mesajı */}
          {success && (
            <div className="flex-grow">
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Proje başarıyla güncellendi! Yönlendiriliyorsunuz...
              </p>
            </div>
          )}
          
          {/* İptal ve Kaydet Düğmeleri */}
          <Link href={`/admin/projects/view/${projectId}`}>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            >
              İptal
            </button>
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-sm font-medium text-white bg-[#0066CC] dark:bg-primary-light hover:bg-[#0055AA] dark:hover:bg-primary rounded-md shadow-sm focus:outline-none ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </span>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 