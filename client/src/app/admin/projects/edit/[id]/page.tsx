'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Proje statüsleri için tip tanımı
type ProjectStatus = 'Planning' | 'InProgress' | 'Completed' | 'Cancelled';

// Form verileri için arayüz
interface FormData {
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  location: string;
  status: ProjectStatus;
  budget: number;
  team: string[];
  equipment: string[];
  description: string;
  notes: string;
}

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  Planning: 'Planlama',
  InProgress: 'Devam Ediyor',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal Edildi',
};

// Ekip üyesi seçimi için örnek veriler
const sampleTeamMembers = [
  { id: '1', name: 'Ahmet Yılmaz', role: 'Teknik Direktör' },
  { id: '2', name: 'Mehmet Öz', role: 'Video Mühendisi' },
  { id: '3', name: 'Ayşe Demir', role: 'Grafik Tasarımcı' },
  { id: '4', name: 'Selin Yıldız', role: 'Proje Koordinatörü' },
  { id: '5', name: 'Burak Aydın', role: 'Ses Mühendisi' },
  { id: '6', name: 'Zeynep Kaya', role: 'Işık Şefi' },
  { id: '7', name: 'Mustafa Çelik', role: 'LED Operatörü' },
  { id: '8', name: 'Özge Yılmaz', role: 'Prodüksiyon Asistanı' },
  { id: '9', name: 'Mert Demir', role: 'Teknik Destek' },
];

// Ekipman seçimi için örnek veriler
const sampleEquipments = [
  { id: '1', name: 'Analog Way Aquilon RS4', category: 'VideoSwitcher' },
  { id: '2', name: 'Dataton Watchpax 60', category: 'MediaServer' },
  { id: '3', name: 'Blackmagic ATEM 4 M/E', category: 'VideoSwitcher' },
  { id: '4', name: 'Barco UDX-4K32', category: 'Projector' },
  { id: '5', name: 'Sony PVM-X2400', category: 'Monitor' },
  { id: '6', name: 'Dell Precision 7920', category: 'Workstation' },
  { id: '7', name: 'DiGiCo S31', category: 'AudioMixer' },
  { id: '8', name: 'GrandMA3 Light', category: 'LightingConsole' },
  { id: '9', name: 'Shure ULXD4', category: 'WirelessMicrophone' },
];

// Müşteri seçimi için örnek veriler
const sampleClients = [
  { id: '1', name: 'TechCon Group' },
  { id: '2', name: 'X Teknoloji A.Ş.' },
  { id: '3', name: 'Y İletişim' },
  { id: '4', name: 'Z Organizasyon' },
  { id: '5', name: 'Mega Holding' },
  { id: '6', name: 'Eğitim Kurumu' },
];

// Örnek proje verileri
const sampleProjects = [
  {
    id: '1',
    name: 'Teknoloji Zirvesi 2023',
    client: 'TechCon Group',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    location: 'İstanbul Kongre Merkezi',
    status: 'Completed',
    budget: 450000,
    team: ['1', '2', '3', '4'],
    equipment: ['1', '2', '3', '4', '5'],
    description: 'Uluslararası teknoloji firmalarının katılımıyla gerçekleşen üç günlük konferans. Ana sahnede panel konuşmaları ve ürün tanıtımları yapıldı.',
    notes: 'Etkinlik çok başarılı geçti. Gelecek yıl için daha büyük bir mekan düşünülmeli.'
  },
  {
    id: '2',
    name: 'Startup Haftası 2023',
    client: 'X Teknoloji A.Ş.',
    startDate: '2023-12-05',
    endDate: '2023-12-07',
    location: 'Lütfi Kırdar Kongre Merkezi',
    status: 'Completed',
    budget: 350000,
    team: ['2', '3', '5', '6'],
    equipment: ['2', '3', '6'],
    description: 'Girişimcilik ekosistemini bir araya getiren üç günlük etkinlik serisi. Startup sunumları, yatırımcı görüşmeleri ve workshop çalışmaları düzenlendi.',
    notes: 'Kablosuz mikrofon sisteminde bazı sorunlar yaşandı, sonraki etkinliklerde yedek sistemler hazır bulundurulmalı.'
  },
  {
    id: '3',
    name: 'Dijital Pazarlama Konferansı',
    client: 'Y İletişim',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    location: 'Hilton Convention Center',
    status: 'InProgress',
    budget: 280000,
    team: ['1', '4', '7', '8'],
    equipment: ['1', '3', '4', '7'],
    description: 'Dijital pazarlama trendlerinin ve yeni teknolojilerin konuşulacağı iki günlük konferans.',
    notes: 'Mekan keşfi tamamlandı, teknik kurulum planları hazırlanıyor.'
  },
  {
    id: '4',
    name: 'Müzik Ödülleri 2024',
    client: 'Z Organizasyon',
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    location: 'Volkswagen Arena',
    status: 'Planning',
    budget: 650000,
    team: ['1', '2', '5', '6', '7', '9'],
    equipment: ['1', '2', '3', '4', '5', '7', '8', '9'],
    description: 'Türkiye\'nin en prestijli müzik ödülleri gecesi. Canlı performanslar ve ödül törenleri düzenlenecek.',
    notes: 'Sanatçılarla koordinasyon toplantıları başladı, sahne tasarımı için çalışılıyor.'
  },
  {
    id: '5',
    name: 'Kurumsal Ürün Lansmanı',
    client: 'Mega Holding',
    startDate: '2024-04-10',
    endDate: '2024-04-10',
    location: 'Four Seasons Hotel',
    status: 'Planning',
    budget: 180000,
    team: ['3', '4', '8'],
    equipment: ['2', '3', '5'],
    description: 'Şirketin yeni ürün serisinin tanıtım etkinliği. Basın mensupları ve iş ortakları katılacak.',
    notes: 'Ürün demoları için ekstra teknik ekipman gerekebilir, bütçe revize edilmeli.'
  },
  {
    id: '6',
    name: 'Bilimsel Araştırma Paneli',
    client: 'Eğitim Kurumu',
    startDate: '2023-10-05',
    endDate: '2023-10-07',
    location: 'Üniversite Kampüsü',
    status: 'Cancelled',
    budget: 120000,
    team: ['2', '4'],
    equipment: ['3', '6'],
    description: 'Akademisyenlerin katılımıyla düzenlenecek bilimsel araştırma ve teknoloji paneli.',
    notes: 'Fon yetersizliği nedeniyle iptal edildi.'
  },
];

export default function EditProject() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  // Form state'leri
  const [formData, setFormData] = useState<FormData>({
    name: '',
    client: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'Planning',
    budget: 0,
    team: [],
    equipment: [],
    description: '',
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

  // Proje verilerini yükle
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // API entegrasyonu olduğunda burada backend'den veri çekilecek
        // const response = await fetch(`/api/admin/projects/${projectId}`);
        // if (!response.ok) throw new Error('Proje bilgileri alınamadı');
        // const data = await response.json();
        
        // Şimdilik örnek verileri kullanıyoruz
        const foundProject = sampleProjects.find(p => p.id === projectId);
        
        // Proje bulunamazsa 404 sayfasına yönlendir
        if (!foundProject) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Form verilerini ayarla
        setFormData({
          name: foundProject.name,
          client: foundProject.client,
          startDate: foundProject.startDate,
          endDate: foundProject.endDate,
          location: foundProject.location,
          status: foundProject.status,
          budget: foundProject.budget,
          team: foundProject.team,
          equipment: foundProject.equipment,
          description: foundProject.description || '',
          notes: foundProject.notes || ''
        });
        
        // Ekip ve ekipman checkbox'larını mevcut verilerle doldur
        const teamStates: { [key: string]: boolean } = {};
        sampleTeamMembers.forEach(member => {
          teamStates[member.id] = foundProject.team.includes(member.id);
        });
        setTeamCheckboxes(teamStates);
        
        const equipmentStates: { [key: string]: boolean } = {};
        sampleEquipments.forEach(equipment => {
          equipmentStates[equipment.id] = foundProject.equipment.includes(equipment.id);
        });
        setEquipmentCheckboxes(equipmentStates);
        
        // Yüklemeyi tamamla
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Proje bilgileri yüklenirken bir hata oluştu');
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
    
    if (!formData.client) {
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
    
    if (formData.budget <= 0) {
      setError('Geçerli bir bütçe girmelisiniz');
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
    setError('');
    
    try {
      // API entegrasyonu olduğunda burada backend'e veri gönderilecek
      // const response = await fetch(`/api/admin/projects/${projectId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // if (!response.ok) throw new Error('Proje güncellenirken bir hata oluştu');
      
      // Başarılı güncelleme için simülasyon
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
        
        // 2 saniye sonra proje detay sayfasına yönlendir
        setTimeout(() => {
          router.push(`/admin/projects/view/${projectId}`);
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setError('Proje güncellenirken bir hata oluştu');
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
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Müşteri <span className="text-red-500">*</span>
              </label>
              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Müşteri seçin</option>
                {sampleClients.map(client => (
                  <option key={client.id} value={client.name}>{client.name}</option>
                ))}
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
                {Object.entries(statusNames).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Bütçe */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bütçe (TL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget === 0 ? '' : formData.budget.toString()}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#0066CC] dark:focus:ring-primary-light focus:border-[#0066CC] dark:focus:border-primary-light dark:bg-gray-700 dark:text-white"
                placeholder="Proje bütçesini girin"
                required
              />
              {formData.budget > 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(formData.budget)}
                </p>
              )}
            </div>
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
                {sampleTeamMembers.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ekip üyesi bulunamadı</p>
                ) : (
                  <div className="space-y-2">
                    {sampleTeamMembers.map(member => (
                      <div key={member.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`team-${member.id}`}
                            type="checkbox"
                            checked={teamCheckboxes[member.id] || false}
                            onChange={() => handleTeamToggle(member.id)}
                            className="focus:ring-[#0066CC] dark:focus:ring-primary-light h-4 w-4 text-[#0066CC] dark:text-primary-light border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`team-${member.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {member.name}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
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
                {sampleEquipments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ekipman bulunamadı</p>
                ) : (
                  <div className="space-y-2">
                    {sampleEquipments.map(equipment => (
                      <div key={equipment.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`equipment-${equipment.id}`}
                            type="checkbox"
                            checked={equipmentCheckboxes[equipment.id] || false}
                            onChange={() => handleEquipmentToggle(equipment.id)}
                            className="focus:ring-[#0066CC] dark:focus:ring-primary-light h-4 w-4 text-[#0066CC] dark:text-primary-light border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`equipment-${equipment.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {equipment.name}
                          </label>
                          <p className="text-gray-500 dark:text-gray-400">{equipment.category}</p>
                        </div>
                      </div>
                    ))}
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