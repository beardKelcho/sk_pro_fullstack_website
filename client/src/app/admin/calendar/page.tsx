'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ProjectStatus } from '@/types/project';
import logger from '@/utils/logger';
import { updateProject } from '@/services/projectService';
import { updateMaintenance } from '@/services/maintenanceService';

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
  date: Date;
  isCurrentMonth: boolean;
  hasEvent: boolean;
  events: Event[];
};

// Takvim satırı tipi
type CalendarRow = CalendarCell[];

// Renk kodları
const statusColors: Record<ProjectStatus, string> = {
  'PLANNING': 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200', // legacy
  'PENDING_APPROVAL': 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  'APPROVED': 'bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200',
  'ACTIVE': 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200',
  'ON_HOLD': 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200', // Sarı - Ertelendi
  'COMPLETED': 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200', // Yeşil - Tamamlandı
  'CANCELLED': 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200' // Kırmızı - İptal Edildi
};

// Durum Türkçe isimleri
const statusNames: Record<ProjectStatus, string> = {
  'PLANNING': 'Onay Bekleyen', // legacy
  'PENDING_APPROVAL': 'Onay Bekleyen',
  'APPROVED': 'Onaylanan',
  'ACTIVE': 'Devam Ediyor',
  'ON_HOLD': 'Ertelendi',
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

type DragPayload = {
  id: string;
  type: 'project' | 'maintenance';
  startDate: string;
  endDate: string;
};

export default function Calendar() {
  // TÜM HOOK'LAR EN ÜSTTE, KOŞULSUZ OLARAK TANIMLANMALI (React Rules of Hooks)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<ProjectStatus[]>(['PENDING_APPROVAL', 'APPROVED', 'ACTIVE']);
  const [projects, setProjects] = useState<Project[]>([]);
  const [maintenances, setMaintenances] = useState<Array<{
    id: string;
    name: string;
    type: string;
    scheduledDate: string;
    status: string;
    equipment: string;
  }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const importFileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Tarih filtrelemesi ve veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Kullanıcı listesini çek (assignee seçimi için)
        try {
          const { getAllUsers } = await import('@/services/userService');
          const usersRes = await getAllUsers({ page: 1, limit: 1000 });
          setUsers((usersRes.users || []).map((u: any) => ({
            id: u._id || u.id || '',
            name: u.name || '',
            email: u.email || '',
          })));
        } catch (userError) {
          logger.warn('Kullanıcı listesi yüklenemedi:', userError);
          setUsers([]);
        }

        // Görünüme göre tarih aralığını hesapla
        let startDate: Date;
        let endDate: Date;
        
        if (view === 'month') {
          // Ay görünümü: Ayın başlangıç ve bitiş tarihleri
          const { year, month } = getMonthDetails(currentDate);
          startDate = new Date(year, month, 1);
          endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        } else if (view === 'week') {
          // Hafta görünümü: Haftanın başlangıç ve bitiş tarihleri
          const weekStart = getStartOfWeek(currentDate);
          startDate = new Date(weekStart);
          endDate = new Date(weekStart);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Gün görünümü: Sadece o gün
          const day = new Date(currentDate);
          day.setHours(0, 0, 0, 0);
          startDate = day;
          endDate = new Date(day);
          endDate.setHours(23, 59, 59, 999);
        }
        
        // Calendar events API'yi kullan (projeler + bakımlar birleşik)
        const apiClient = (await import('@/services/api/axios')).default;
        const response = await apiClient.get('/calendar/events', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: selectedProjectStatuses.join(','),
          },
        });
        
        if (response.data && response.data.success !== false) {
          // API response formatını kontrol et
          const events = response.data.events || response.data || [];
          
          // Projeleri ayır ve formatla
          const calendarProjects: Project[] = Array.isArray(events)
            ? events
                .filter((event: any) => event.type === 'project' && showProjects)
                .map((event: any) => ({
                  id: event.id || event._id,
                  name: event.name || 'İsimsiz Proje',
                  client: event.client || '', 
                  startDate: event.startDate,
                  endDate: event.endDate || event.startDate,
                  location: event.location || '',
                  status: (event.status || 'PENDING_APPROVAL') as ProjectStatus,
                  team: event.team || [],
                  equipment: event.equipment || [],
                }))
            : [];
          
          setProjects(calendarProjects);
          
          // Bakımları ayır ve formatla
          const calendarMaintenances = Array.isArray(events)
            ? events
                .filter((event: any) => event.type === 'maintenance' && showEquipment)
                .map((event: any) => ({
                  id: event.id || event._id,
                  name: event.name || 'Bakım',
                  type: event.type || 'ROUTINE',
                  scheduledDate: event.startDate || event.scheduledDate,
                  status: event.status || 'SCHEDULED',
                  equipment: event.equipment || '',
                }))
            : [];
          
          setMaintenances(calendarMaintenances);
        } else {
          // API'den veri gelmediyse boş liste göster
          setProjects([]);
          setMaintenances([]);
        }
        
        setLoading(false);
      } catch (error) {
        logger.error('Takvim verileri yükleme hatası:', error);
        // Hata durumunda boş liste göster
        setProjects([]);
        setMaintenances([]);
        setLoading(false);
        toast.error('Takvim verileri yüklenirken bir hata oluştu');
      }
    };
    
    fetchData();
  }, [selectedProjectStatuses, currentDate, showEquipment, showProjects, view]);
  
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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 Pazar
    const diffToMonday = day === 0 ? -6 : 1 - day; // Pazartesi başlangıç
    d.setDate(d.getDate() + diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const toISODateOnly = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
  };
  
  // Ay ismini al - Admin paneli i18n dışında olduğu için sabit Türkçe kullan
  const getMonthName = (date: Date) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
            status: 'PENDING_APPROVAL' as ProjectStatus, // Bakımlar için varsayılan durum (renk için)
            startDate: maintenance.scheduledDate,
            endDate: maintenance.scheduledDate,
            type: 'maintenance'
          });
        });
    }
    
    return events;
  }

  const handleDragStart = useCallback((e: React.DragEvent, payload: DragPayload) => {
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) {
      logger.error('DragStart payload set error:', err);
    }
  }, []);

  const handleDropOnDate = useCallback(
    async (e: React.DragEvent, targetDate: Date) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;

      let payload: DragPayload | null = null;
      try {
        payload = JSON.parse(raw) as DragPayload;
      } catch {
        payload = null;
      }
      if (!payload?.id || !payload?.type) return;

      const newStart = new Date(targetDate);
      newStart.setHours(0, 0, 0, 0);

      if (payload.type === 'project') {
        const oldStart = new Date(payload.startDate);
        const oldEnd = new Date(payload.endDate || payload.startDate);
        const durationMs = oldEnd.getTime() - oldStart.getTime();
        const newEnd = new Date(newStart.getTime() + Math.max(0, durationMs));

        // Optimistic update
        const prev = projects;
        setProjects((curr) =>
          curr.map((p) =>
            p.id === payload!.id
              ? { ...p, startDate: toISODateOnly(newStart), endDate: toISODateOnly(newEnd) }
              : p
          )
        );

        toast.info('Proje tarihi güncelleniyor...');
        try {
          await updateProject(payload.id, {
            startDate: toISODateOnly(newStart),
            endDate: toISODateOnly(newEnd),
          } as any);
          toast.success('Proje tarihi güncellendi');
        } catch (err: any) {
          logger.error('Project date update error:', err);
          setProjects(prev);
          toast.error(err?.message || 'Proje tarihi güncellenemedi');
        }
      } else {
        // maintenance
        const prev = maintenances;
        setMaintenances((curr) =>
          curr.map((m) => (m.id === payload!.id ? { ...m, scheduledDate: toISODateOnly(newStart) } : m))
        );

        toast.info('Bakım tarihi güncelleniyor...');
        try {
          await updateMaintenance(payload.id, { scheduledDate: toISODateOnly(newStart) } as any);
          toast.success('Bakım tarihi güncellendi');
        } catch (err: any) {
          logger.error('Maintenance date update error:', err);
          setMaintenances(prev);
          toast.error(err?.message || 'Bakım tarihi güncellenemedi');
        }
      }
    },
    [maintenances, projects]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Ay görünümü oluştur
  const renderMonth = () => {
    const { firstDayOfWeek, daysInMonth, year, month } = getMonthDetails(currentDate);
    
    // Takvim hücreleri oluştur
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      const events = getEventsForDay(day, year, month);
      
      return {
        day,
        date,
        isCurrentMonth: true,
        hasEvent: events.length > 0,
        events
      } as CalendarCell;
    });

    // Önceki ayın günlerini ekle
    const prevMonthDays = Array.from({ length: firstDayOfWeek - 1 }, (_, i) => {
      const day = new Date(year, month, 0).getDate() - (firstDayOfWeek - 2) + i;
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);
      const events = getEventsForDay(day, year, month - 1);
      
      return {
        day,
        date,
        isCurrentMonth: false,
        hasEvent: events.length > 0,
        events
      } as CalendarCell;
    });

    // Sonraki ayın günlerini ekle
    const remainder = (days.length + prevMonthDays.length) % 7;
    const remainingDays = remainder === 0 ? 0 : 7 - remainder;
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month + 1, day);
      date.setHours(0, 0, 0, 0);
      const events = getEventsForDay(day, year, month + 1);
      
      return {
        day,
        date,
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
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnDate(e, cell.date)}
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
                                <div
                                  draggable
                                  onDragStart={(e) =>
                                    handleDragStart(e, {
                                      id: event.id,
                                      type: event.type || 'project',
                                      startDate: event.startDate,
                                      endDate: event.endDate,
                                    })
                                  }
                                  className={`p-1 mb-1 text-xs rounded truncate cursor-move ${
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

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [currentDate]);

  const renderWeek = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {weekDays[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary"
            >
              Bugün
            </button>
            <button
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {weekDays.map((d) => {
            const y = d.getFullYear();
            const m = d.getMonth();
            const day = d.getDate();
            const events = getEventsForDay(day, y, m);
            const isToday = new Date().toDateString() === d.toDateString();

            return (
              <div
                key={d.toISOString()}
                className="bg-white dark:bg-gray-800 min-h-[180px] p-3"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnDate(e, d)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][d.getDay() === 0 ? 6 : d.getDay() - 1]}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isToday ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {day}
                  </div>
                </div>
                <div className="space-y-1">
                  {events.length === 0 ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500">Etkinlik yok</div>
                  ) : (
                    events.map((event, idx) => {
                      const href =
                        event.type === 'maintenance' ? `/admin/maintenance/edit/${event.id}` : `/admin/projects/view/${event.id}`;
                      return (
                        <Link href={href} key={`${event.id}-${idx}`}>
                          <div
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(e, {
                                id: event.id,
                                type: event.type || 'project',
                                startDate: event.startDate,
                                endDate: event.endDate,
                              })
                            }
                            className={`p-2 text-xs rounded cursor-move ${
                              event.type === 'maintenance'
                                ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                : statusColors[event.status]
                            }`}
                          >
                            {event.type === 'maintenance' && '🔧 '}
                            {event.name}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDay = () => {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    const events = getEventsForDay(d.getDate(), d.getFullYear(), d.getMonth());

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-[#0066CC] dark:bg-primary-light text-white rounded-md hover:bg-[#0055AA] dark:hover:bg-primary"
            >
              Bugün
            </button>
            <button
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4" onDragOver={handleDragOver} onDrop={(e) => handleDropOnDate(e, d)}>
          {events.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">Bu gün için etkinlik yok</div>
          ) : (
            <div className="space-y-2">
              {events.map((event, idx) => {
                const href =
                  event.type === 'maintenance' ? `/admin/maintenance/edit/${event.id}` : `/admin/projects/view/${event.id}`;
                return (
                  <Link href={href} key={`${event.id}-${idx}`}>
                    <div
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, {
                          id: event.id,
                          type: event.type || 'project',
                          startDate: event.startDate,
                          endDate: event.endDate,
                        })
                      }
                      className={`p-3 rounded cursor-move ${
                        event.type === 'maintenance'
                          ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                          : statusColors[event.status]
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {event.type === 'maintenance' && '🔧 '}
                        {event.name}
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        {event.type === 'maintenance' ? 'Bakım' : 'Proje'} • {statusNames[event.status] || event.status}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Yükleniyor durumu - hook'lardan SONRA kontrol edilmeli
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

  const handleDownloadIcs = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const params = new URLSearchParams({
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      status: selectedProjectStatuses.join(','),
    });
    window.location.href = `/api/calendar/ics?${params.toString()}`;
  };

  const handleImportIcs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics') && file.type !== 'text/calendar') {
      toast.error('Sadece .ics dosyaları yüklenebilir');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await fetch('/api/calendar/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'iCal dosyası başarıyla içe aktarıldı');
        setShowImportModal(false);
        if (importFileInputRef.current) {
          importFileInputRef.current.value = '';
        }
        // Takvimi yenile
        window.location.reload();
      } else {
        throw new Error(data.message || 'iCal import başarısız');
      }
    } catch (error: any) {
      logger.error('iCal import hatası:', error);
      toast.error(error.message || 'iCal dosyası içe aktarılırken bir hata oluştu');
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Proje Takvimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Planlanan ve devam eden tüm projelerinizi görüntüleyin</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadIcs}
            className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="iCal indir"
          >
            iCal İndir
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1 text-sm rounded-md bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700"
            aria-label="iCal içe aktar"
          >
            iCal İçe Aktar
          </button>
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
        {view === 'week' && renderWeek()}
        {view === 'day' && renderDay()}
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

      {/* iCal Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">iCal Dosyası İçe Aktar</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              .ics formatındaki takvim dosyasını yükleyerek projeleri içe aktarabilirsiniz.
            </p>
            <div className="mb-4">
              <input
                ref={importFileInputRef}
                type="file"
                accept=".ics,text/calendar"
                onChange={handleImportIcs}
                disabled={importing}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  if (importFileInputRef.current) {
                    importFileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                disabled={importing}
              >
                İptal
              </button>
            </div>
            {importing && (
              <div className="mt-4 text-center">
                <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">İçe aktarılıyor...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 