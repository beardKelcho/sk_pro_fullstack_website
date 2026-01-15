'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectStatus } from '@/types/project';
import logger from '@/utils/logger';

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


// Takvim hücresi tipi
type CalendarCell = {
  day: number;
  isCurrentMonth: boolean;
  hasEvent: boolean;
  events: Event[];
};

// Takvim satırı tipi
type CalendarRow = CalendarCell[];

// Renk kodları
const statusColors: Record<ProjectStatus, string> = {
  'PLANNING': 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  'ACTIVE': 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
  'COMPLETED': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  'CANCELLED': 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
};

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  'PLANNING': 'Planlama',
  'ACTIVE': 'Devam Ediyor',
  'COMPLETED': 'Tamamlandı',
  'CANCELLED': 'İptal Edildi'
};

interface Event {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  type?: 'project' | 'maintenance';
}

export default function Calendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<ProjectStatus[]>(['PLANNING', 'ACTIVE']);
  const [projects, setProjects] = useState<Project[]>([]);
  const [maintenances, setMaintenances] = useState<Array<{
    id: string;
    name: string;
    type: string;
    scheduledDate: string;
    status: string;
    equipment: string;
  }>>([]);
  
  // Tarih filtrelemesi ve veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Ayın başlangıç ve bitiş tarihlerini hesapla
        const { year, month } = getMonthDetails(currentDate);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        
        // API'den projeleri çek (tarih filtresi ile)
        const { getAllProjects } = await import('@/services/projectService');
        const projectResponse = await getAllProjects({
          status: selectedProjectStatuses.join(','),
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          limit: 1000, // Takvim için yeterli sayıda proje çek
        });
        
        // Projeleri calendar formatına çevir
        const calendarProjects: Project[] = projectResponse.projects
          .map((project: {
            _id?: string;
            id?: string;
            name?: string;
            client?: string | { name?: string };
            startDate?: string;
            endDate?: string;
            location?: string;
            status?: ProjectStatus;
            team?: Array<string | { _id?: string; id?: string }>;
            equipment?: Array<string | { _id?: string; id?: string }>;
          }) => ({
            id: project._id || project.id || '',
            name: project.name || '',
            client: typeof project.client === 'object' && project.client ? project.client.name || '' : project.client || '',
            startDate: project.startDate || '',
            endDate: project.endDate || project.startDate || '',
            location: project.location || '',
            status: project.status || 'PLANNING',
            team: Array.isArray(project.team) ? project.team.map((t: string | { _id?: string; id?: string }) => typeof t === 'string' ? t : (t._id || t.id || '')) : [],
            equipment: Array.isArray(project.equipment) ? project.equipment.map((e: string | { _id?: string; id?: string }) => typeof e === 'string' ? e : (e._id || e.id || '')) : [],
          }));
        
        setProjects(calendarProjects);
        
        // API'den bakımları çek (eğer gösteriliyorsa)
        if (showEquipment) {
          const { getAllMaintenance } = await import('@/services/maintenanceService');
          const maintenanceResponse = await getAllMaintenance({
            status: 'SCHEDULED,IN_PROGRESS',
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString(),
            limit: 1000, // Takvim için yeterli sayıda bakım çek
          });
          
          // Bakımları calendar formatına çevir
          const calendarMaintenances = maintenanceResponse.maintenances
            .map((maintenance: {
              _id?: string;
              id?: string;
              equipment?: { name?: string; _id?: string } | string;
              type?: string;
              scheduledDate?: string;
              status?: string;
            }) => ({
              id: maintenance._id || maintenance.id || '',
              name:
                typeof maintenance.equipment === 'string'
                  ? 'Bakım'
                  : maintenance.equipment?.name || 'Bakım',
              type: maintenance.type || 'ROUTINE',
              scheduledDate: maintenance.scheduledDate || '',
              status: maintenance.status || 'SCHEDULED',
              equipment:
                typeof maintenance.equipment === 'string'
                  ? maintenance.equipment
                  : maintenance.equipment?._id || '',
            }));
          
          setMaintenances(calendarMaintenances);
        } else {
          setMaintenances([]);
        }
        
        setLoading(false);
      } catch (error) {
        logger.error('Veri yükleme hatası:', error);
        // Hata durumunda boş liste göster
        setProjects([]);
        setMaintenances([]);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProjectStatuses, currentDate, showEquipment]);
  
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
    const events: Event[] = [];
    
    // Projeleri ekle
    if (showProjects) {
      projects
        .filter(project => {
          if (!project.startDate) return false;
          const startDate = new Date(project.startDate);
          const endDate = project.endDate ? new Date(project.endDate) : startDate;
          return date >= startDate && date <= endDate;
        })
        .forEach(project => {
          events.push({
            id: project.id,
            name: project.name,
            status: project.status as ProjectStatus,
            startDate: project.startDate,
            endDate: project.endDate || project.startDate,
            type: 'project'
          });
        });
    }
    
    // Bakımları ekle
    if (showEquipment) {
      maintenances
        .filter(maintenance => {
          if (!maintenance.scheduledDate) return false;
          const scheduledDate = new Date(maintenance.scheduledDate);
          return scheduledDate.toDateString() === date.toDateString();
        })
        .forEach(maintenance => {
          events.push({
            id: maintenance.id,
            name: maintenance.name || 'Bakım',
            status: 'PLANNING' as ProjectStatus, // Bakımlar için varsayılan durum
            startDate: maintenance.scheduledDate,
            endDate: maintenance.scheduledDate,
            type: 'maintenance'
          });
        });
    }
    
    return events;
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
                          {cell.events.map((event: Event, eventIndex) => {
                            const href = event.type === 'maintenance' 
                              ? `/admin/maintenance/edit/${event.id}` 
                              : `/admin/projects/view/${event.id}`;
                            return (
                              <Link href={href} key={eventIndex}>
                                <div className={`p-1 mb-1 text-xs rounded truncate ${
                                  event.type === 'maintenance' 
                                    ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                    : statusColors[event.status]
                                }`}>
                                  {event.type === 'maintenance' && '🔧 '}
                                  {event.name}
                                </div>
                              </Link>
                            );
                          })}
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