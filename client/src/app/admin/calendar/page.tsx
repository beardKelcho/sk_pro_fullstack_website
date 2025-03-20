'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectStatus } from '@/types/project';

// Proje arayüzü
interface Project {
  id: string;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  location: string;
  status: ProjectStatus;
  team: string[];
  equipment: string[];
}

// Ekipman için tip tanımı
type EquipmentStatus = 'Available' | 'InUse' | 'Maintenance' | 'Faulty';

// Ekipman arayüzü
interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

// Ekipman rezervasyonu için arayüz
interface EquipmentReservation {
  id: string;
  equipmentId: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

// Takvim hücresi tipi
type CalendarCell = {
  day: number;
  isCurrentMonth: boolean;
  hasEvent: boolean;
  events: any[];
};

// Takvim satırı tipi
type CalendarRow = CalendarCell[];

// Renk kodları
const statusColors: Record<ProjectStatus, string> = {
  'active': 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
  'planned': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  'completed': 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  'cancelled': 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200',
  'pending': 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
};

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  'active': 'Tamamlandı',
  'planned': 'Planlama',
  'completed': 'Tamamlandı',
  'cancelled': 'İptal Edildi',
  'pending': 'Devam Ediyor'
};

// Örnek proje verileri
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Teknoloji Zirvesi 2023',
    client: 'TechCon Group',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    location: 'İstanbul Kongre Merkezi',
    status: 'completed',
    team: ['1', '2', '3', '4'],
    equipment: ['1', '2', '3', '4', '5'],
  },
  {
    id: '2',
    name: 'Startup Haftası 2023',
    client: 'X Teknoloji A.Ş.',
    startDate: '2023-12-05',
    endDate: '2023-12-07',
    location: 'Lütfi Kırdar Kongre Merkezi',
    status: 'completed',
    team: ['2', '3', '5', '6'],
    equipment: ['2', '3', '6'],
  },
  {
    id: '3',
    name: 'Dijital Pazarlama Konferansı',
    client: 'Y İletişim',
    startDate: '2024-02-15',
    endDate: '2024-02-16',
    location: 'Hilton Convention Center',
    status: 'pending',
    team: ['1', '4', '7', '8'],
    equipment: ['1', '3', '4', '7'],
  },
  {
    id: '4',
    name: 'Müzik Ödülleri 2024',
    client: 'Z Organizasyon',
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    location: 'Volkswagen Arena',
    status: 'planned',
    team: ['1', '2', '5', '6', '7', '9'],
    equipment: ['1', '2', '3', '4', '5', '7', '8', '9'],
  },
  {
    id: '5',
    name: 'Kurumsal Ürün Lansmanı',
    client: 'Mega Holding',
    startDate: '2024-04-10',
    endDate: '2024-04-10',
    location: 'Four Seasons Hotel',
    status: 'planned',
    team: ['3', '4', '8'],
    equipment: ['2', '3', '5'],
  },
  {
    id: '6',
    name: 'Bilimsel Araştırma Paneli',
    client: 'Eğitim Kurumu',
    startDate: '2023-10-05',
    endDate: '2023-10-07',
    location: 'Üniversite Kampüsü',
    status: 'cancelled',
    team: ['2', '4'],
    equipment: ['3', '6'],
  },
];

// Ekipman örnek verileri
const sampleEquipments: Equipment[] = [
  { id: '1', name: 'Analog Way Aquilon RS4', category: 'VideoSwitcher', status: 'Available' },
  { id: '2', name: 'Dataton Watchpax 60', category: 'MediaServer', status: 'InUse' },
  { id: '3', name: 'Blackmagic ATEM 4 M/E', category: 'VideoSwitcher', status: 'Available' },
  { id: '4', name: 'Barco UDX-4K32', category: 'Projector', status: 'InUse' },
  { id: '5', name: 'Sony PVM-X2400', category: 'Monitor', status: 'Available' },
  { id: '6', name: 'Dell Precision 7920', category: 'Workstation', status: 'Available' },
  { id: '7', name: 'DiGiCo S31', category: 'AudioMixer', status: 'Maintenance', nextMaintenanceDate: '2024-04-05' },
  { id: '8', name: 'GrandMA3 Light', category: 'LightingConsole', status: 'InUse' },
  { id: '9', name: 'Shure ULXD4', category: 'WirelessMicrophone', status: 'Faulty' },
];

// Ekipman rezervasyonları örnek verileri
const sampleReservations: EquipmentReservation[] = [
  { id: '1', equipmentId: '1', projectId: '3', startDate: '2024-02-15', endDate: '2024-02-16' },
  { id: '2', equipmentId: '2', projectId: '3', startDate: '2024-02-15', endDate: '2024-02-16' },
  { id: '3', equipmentId: '4', projectId: '3', startDate: '2024-02-15', endDate: '2024-02-16' },
  { id: '4', equipmentId: '1', projectId: '4', startDate: '2024-03-20', endDate: '2024-03-20' },
  { id: '5', equipmentId: '2', projectId: '4', startDate: '2024-03-20', endDate: '2024-03-20' },
  { id: '6', equipmentId: '2', projectId: '5', startDate: '2024-04-10', endDate: '2024-04-10' },
];

interface Event {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<ProjectStatus[]>(['planned', 'pending']);
  
  // Tarihi formatlama
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Tarih filtrelemesi ve veri yükleme
  useEffect(() => {
    setLoading(true);
    
    // API entegrasyonu olduğunda burada backend'den veri çekilecek
    // const fetchData = async () => {
    //   try {
    //     const projectResponse = await fetch('/api/admin/projects');
    //     const equipmentResponse = await fetch('/api/admin/equipment');
    //     const reservationsResponse = await fetch('/api/admin/reservations');
    //     
    //     if (!projectResponse.ok || !equipmentResponse.ok || !reservationsResponse.ok) 
    //       throw new Error('Veri çekme hatası');
    //     
    //     const projectsData = await projectResponse.json();
    //     const equipmentData = await equipmentResponse.json();
    //     const reservationsData = await reservationsResponse.json();
    //     
    //     setProjects(projectsData);
    //     setEquipments(equipmentData);
    //     setReservations(reservationsData);
    //   } catch (error) {
    //     console.error('Veri yükleme hatası:', error);
    //   }
    // };
    
    // Şimdilik örnek verileri kullanarak simüle ediyoruz
    setTimeout(() => {
      // Projeleri filtreleme - sadece seçili durumları göster
      const filtered = sampleProjects.filter(project => 
        selectedProjectStatuses.includes(project.status)
      );
      
      setFilteredProjects(filtered);
      setLoading(false);
    }, 500);
    
  }, [selectedProjectStatuses]);
  
  // Sonraki aya geç
  const nextMonth = () => {
    setCurrentDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setMonth(nextDate.getMonth() + 1);
      return nextDate;
    });
  };
  
  // Önceki aya geç
  const prevMonth = () => {
    setCurrentDate(prev => {
      const prevDate = new Date(prev);
      prevDate.setMonth(prevDate.getMonth() - 1);
      return prevDate;
    });
  };
  
  // Bugünün tarihine dön
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Ayın ilk gününü ve toplam gün sayısını hesapla
  const getMonthDetails = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);
    
    // Ayın toplam gün sayısı
    const daysInMonth = lastDay.getDate();
    
    // Ayın ilk gününün hafta içi gününü al (0: Pazar, 1: Pazartesi, ...)
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Pazar günü 7'ye ayarlanıyor
    
    return { firstDayOfWeek, daysInMonth, year, month };
  };
  
  // Ay ismini al
  const getMonthName = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };
  
  // Belirli bir gün için etkinlikleri getir
  function getEventsForDay(day: number, year: number, month: number): Event[] {
    const date = new Date(year, month, day);
    const formattedDate = date.toISOString().split('T')[0];
    
    return sampleProjects
      .filter(project => {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        return date >= startDate && date <= endDate;
      })
      .map(project => ({
        id: project.id,
        name: project.name,
        status: project.status as ProjectStatus,
        startDate: project.startDate,
        endDate: project.endDate
      }));
  }
  
  // Ay görünümü oluştur
  const renderMonth = () => {
    const { firstDayOfWeek, daysInMonth, year, month } = getMonthDetails(currentDate);
    
    // Takvim hücreleri oluştur
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const events = getEventsForDay(day, year, month);
      
      return {
        day,
        isCurrentMonth: true,
        hasEvent: events.length > 0,
        events
      } as CalendarCell;
    });

    // Önceki ayın günlerini ekle
    const prevMonthDays = Array.from({ length: firstDayOfWeek - 1 }, (_, i) => {
      const day = new Date(year, month, 0).getDate() - (firstDayOfWeek - 2) + i;
      const events = getEventsForDay(day, year, month - 1);
      
      return {
        day,
        isCurrentMonth: false,
        hasEvent: events.length > 0,
        events
      } as CalendarCell;
    });

    // Sonraki ayın günlerini ekle
    const remainingDays = 7 - ((days.length + prevMonthDays.length) % 7);
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const day = i + 1;
      const events = getEventsForDay(day, year, month + 1);
      
      return {
        day,
        isCurrentMonth: false,
        hasEvent: events.length > 0,
        events
      } as CalendarCell;
    });

    // Tüm günleri birleştir
    const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

    // Günleri haftalara böl
    const rows: CalendarRow[] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{getMonthName(currentDate)}</h2>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary"
            >
              Bugün
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border dark:border-gray-700">
            <thead>
              <tr>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                  <th key={index} className="border dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800/50">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`border dark:border-gray-700 p-1 h-32 w-32 align-top ${
                        !cell.isCurrentMonth ? 'bg-gray-100 dark:bg-gray-800/30' : ''
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between">
                          <span className="text-sm">{cell.day}</span>
                          {cell.hasEvent && (
                            <span className="rounded-full h-2 w-2 bg-[#0066CC] dark:bg-primary-light"></span>
                          )}
                        </div>
                        <div className="flex-grow overflow-y-auto mt-1">
                          {cell.events.map((event: Event, eventIndex) => (
                            <Link href={`/admin/projects/view/${event.id}`} key={eventIndex}>
                              <div className={`p-1 mb-1 text-xs rounded truncate ${statusColors[event.status]}`}>
                                {event.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Proje Takvimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Planlanan ve devam eden tüm projelerinizi görüntüleyin</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'month'
                ? 'bg-[#0066CC] dark:bg-primary-light text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Ay
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'week'
                ? 'bg-[#0066CC] dark:bg-primary-light text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Hafta
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 text-sm rounded-md ${
              view === 'day'
                ? 'bg-[#0066CC] dark:bg-primary-light text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Gün
          </button>
        </div>
      </div>
      
      {/* Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtreler</h3>
        <div className="flex flex-wrap gap-3">
          {/* Proje Durumu Filtreleri */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Proje Durumu</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusNames) as ProjectStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (selectedProjectStatuses.includes(status)) {
                      setSelectedProjectStatuses(prevStatuses => 
                        prevStatuses.filter(s => s !== status)
                      );
                    } else {
                      setSelectedProjectStatuses(prevStatuses => [...prevStatuses, status]);
                    }
                  }}
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedProjectStatuses.includes(status)
                      ? statusColors[status]
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {statusNames[status]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Görüntüleme Seçenekleri */}
          <div className="space-y-2 ml-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Görüntüleme</p>
            <div className="flex gap-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-[#0066CC] dark:text-primary-light rounded border-gray-300 dark:border-gray-600"
                  checked={showProjects}
                  onChange={() => setShowProjects(!showProjects)}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Projeler</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-[#0066CC] dark:text-primary-light rounded border-gray-300 dark:border-gray-600"
                  checked={showEquipment}
                  onChange={() => setShowEquipment(!showEquipment)}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Ekipmanlar</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Takvim Görünümü */}
      <div className="space-y-4">
        {view === 'month' && renderMonth()}
        {view === 'week' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-center text-gray-500 dark:text-gray-400">Haftalık görünüm yakında eklenecek</p>
          </div>
        )}
        {view === 'day' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-center text-gray-500 dark:text-gray-400">Günlük görünüm yakında eklenecek</p>
          </div>
        )}
      </div>
      
      {/* Lejant */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Renk Kodları</h3>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(statusNames) as ProjectStatus[]).map(status => (
            <div key={status} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${statusColors[status].split(' ')[0]}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{statusNames[status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 