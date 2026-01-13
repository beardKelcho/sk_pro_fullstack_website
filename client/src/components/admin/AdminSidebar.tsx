'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Sidebar menüsü için tip tanımlaması
interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
}

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const EquipmentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
  </svg>
);

const ClientIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

const TaskIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const MonitoringIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

// Ana menü öğeleri
const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Monitoring',
    path: '/admin/monitoring',
    icon: <MonitoringIcon />,
  },
  {
    title: 'Ekipman Yönetimi',
    path: '/admin/equipment',
    icon: <EquipmentIcon />,
    submenu: [
      {
        title: 'Tüm Ekipmanlar',
        path: '/admin/equipment',
        icon: <></>,
      },
      {
        title: 'Ekipman Ekle',
        path: '/admin/equipment/add',
        icon: <></>,
      },
      {
        title: 'Bakım Takibi',
        path: '/admin/equipment/maintenance',
        icon: <></>,
      }
    ],
  },
  {
    title: 'Proje Yönetimi',
    path: '/admin/projects',
    icon: <ProjectIcon />,
    submenu: [
      {
        title: 'Tüm Projeler',
        path: '/admin/projects',
        icon: <></>,
      },
      {
        title: 'Yeni Proje Ekle',
        path: '/admin/projects/add',
        icon: <></>,
      },
    ],
  },
  {
    title: 'Takvim',
    path: '/admin/calendar',
    icon: <CalendarIcon />,
  },
  {
    title: 'Müşteriler',
    path: '/admin/clients',
    icon: <ClientIcon />,
    submenu: [
      {
        title: 'Tüm Müşteriler',
        path: '/admin/clients',
        icon: <></>,
      },
      {
        title: 'Yeni Müşteri Ekle',
        path: '/admin/clients/add',
        icon: <></>,
      },
    ],
  },
  {
    title: 'Görevler',
    path: '/admin/tasks',
    icon: <TaskIcon />,
    submenu: [
      {
        title: 'Tüm Görevler',
        path: '/admin/tasks',
        icon: <></>,
      },
      {
        title: 'Görev Ekle',
        path: '/admin/tasks/add',
        icon: <></>,
      },
    ],
  },
  {
    title: 'Bildirimler',
    path: '/admin/notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    submenu: [
      {
        title: 'Bildirim Merkezi',
        path: '/admin/notifications',
        icon: <></>,
      },
      {
        title: 'Bildirim Ayarları',
        path: '/admin/notification-settings',
        icon: <></>,
      },
    ],
  },
  {
    title: 'Aktivite Logları',
    path: '/admin/audit-logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Oturum Yönetimi',
    path: '/admin/sessions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Rapor Zamanlama',
    path: '/admin/report-schedules',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Kullanıcılar',
    path: '/admin/users',
    icon: <UserIcon />,
    submenu: [
      {
        title: 'Tüm Kullanıcılar',
        path: '/admin/users',
        icon: <></>,
      },
      {
        title: 'Kullanıcı Ekle',
        path: '/admin/users/add',
        icon: <></>,
      },
      {
        title: 'Yetki Yönetimi',
        path: '/admin/permissions',
        icon: <></>,
      },
    ],
  },
  {
    title: 'QR Kod Yönetimi',
    path: '/admin/qr-codes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    title: 'Site Yönetimi',
    path: '/admin/site-content',
    icon: <SettingsIcon />,
    submenu: [
      {
        title: 'Site İçeriği',
        path: '/admin/site-content',
        icon: <></>,
      },
      {
        title: 'Tüm Resimler',
        path: '/admin/site-images',
        icon: <></>,
      },
      {
        title: 'Proje Görselleri',
        path: '/admin/project-gallery',
        icon: <></>,
      },
    ],
  },
  {
    title: 'Ayarlar',
    path: '/admin/settings',
    icon: <SettingsIcon />,
  },
  {
    title: '2FA Ayarları',
    path: '/admin/two-factor',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const isActive = useCallback((path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  }, [pathname]);

  // Pathname değiştiğinde aktif menüyü otomatik aç
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu && isActive(item.path)) {
        setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname, isActive]);

  const toggleSubMenu = useCallback((title: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  return (
    <div 
      className={`h-screen glass dark:glass-dark shadow-2xl transition-all duration-500 ease-in-out
        border-r border-white/20 dark:border-white/10 flex flex-col relative overflow-hidden
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-animated opacity-10 dark:opacity-5 pointer-events-none" />
      
      {/* Floating particles effect - Performans için azaltıldı */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#0066CC] rounded-full opacity-20 float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${6 + i}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Logo ve başlık */}
      <div className="h-16 flex items-center px-4 border-b border-white/20 dark:border-white/10 relative z-10">
        {collapsed ? (
          <div className="w-full flex justify-center">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover-glow pulse-glow">
              SK
            </div>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg hover-glow pulse-glow">
              SK
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">SK Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Production</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar toggle buton - mobil */}
      <button
        className="lg:hidden absolute top-3 right-3 p-1 rounded-md bg-gray-200 dark:bg-gray-700"
        onClick={onToggleCollapse}
      >
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      {/* Ana menü */}
      <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={item.title} className="slide-in-left" style={{ animationDelay: `${index * 0.05}s` }}>
              {item.submenu ? (
                <div>
                  <button
                    className={`
                      flex items-center w-full py-3 px-4 text-left relative overflow-hidden
                      ${isActive(item.path) 
                        ? 'bg-gradient-to-r from-[#0066CC]/20 to-[#00C49F]/20 text-[#0066CC] dark:text-primary-light shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light'}
                      rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 modern-card
                      ${isActive(item.path) ? 'neon-border' : ''}
                    `}
                    onClick={(e) => toggleSubMenu(item.title, e)}
                  >
                    <span className="flex items-center relative z-10">
                      <span className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform hover:scale-110`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </span>
                    {!collapsed && (
                      <span className="ml-auto relative z-10">
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ${openMenus[item.title] ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </span>
                    )}
                  </button>
                  {!collapsed && openMenus[item.title] && item.submenu && (
                    <ul className="ml-4 mt-2 space-y-1 border-l-2 border-[#0066CC]/30 pl-4">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            href={subItem.path}
                            prefetch={false}
                            scroll={true}
                            className={`
                              flex items-center py-2 px-3 relative
                              ${isActive(subItem.path) 
                                ? 'text-[#0066CC] dark:text-primary-light font-semibold' 
                                : 'text-gray-600 dark:text-gray-400'}
                              rounded-lg hover:bg-white/10 dark:hover:bg-white/5 hover:text-[#0066CC] dark:hover:text-primary-light 
                              transition-all duration-300 hover:translate-x-1
                            `}
                            onClick={(e) => {
                              // Navigation'ı garanti altına al
                              if (pathname === subItem.path) {
                                e.preventDefault();
                                return;
                              }
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  prefetch={false}
                  scroll={true}
                  className={`
                    flex items-center py-3 px-4 relative overflow-hidden
                    ${isActive(item.path) 
                      ? 'bg-gradient-to-r from-[#0066CC]/20 to-[#00C49F]/20 text-[#0066CC] dark:text-primary-light shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#0066CC] dark:hover:text-primary-light'}
                    rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 modern-card
                    ${isActive(item.path) ? 'neon-border' : ''}
                  `}
                  onClick={(e) => {
                    // Navigation'ı garanti altına al
                    if (pathname === item.path) {
                      e.preventDefault();
                      return;
                    }
                  }}
                >
                  <span className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform hover:scale-110 relative z-10`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="font-medium relative z-10">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer menü öğeleri */}
      <div className="p-3 mt-auto border-t border-white/20 dark:border-white/10 relative z-10">
        <button
          className={`
            flex items-center w-full py-3 px-4 
            text-gray-700 dark:text-gray-300
            rounded-xl hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 
            hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 modern-card
            group
          `}
        >
          <span className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-110`}>
            <LogoutIcon />
          </span>
          {!collapsed && <span className="font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
} 