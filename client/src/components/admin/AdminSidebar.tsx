'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUserRole } from '@/utils/authStorage';
import { Role } from '@/config/permissionCore';
import AdminIcon, { type AdminIconName } from '@/components/admin/AdminIcon';

// Sidebar menüsü için tip tanımlaması
interface MenuItem {
  title: string;
  path: string;
  icon?: AdminIconName;
  submenu?: MenuItem[];
  roles?: string[]; // Allowed roles (if defined, restricted to these)
}

// Ana menü öğeleri
const initialMenuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'dashboard',
  },
  {
    title: 'Site Yönetimi',
    path: '/admin/site-management',
    icon: 'globe',
  },
  {
    title: 'Monitoring',
    path: '/admin/monitoring',
    icon: 'monitoring',
    roles: [Role.ADMIN, Role.FIRMA_SAHIBI], // Only admin and business_owner
  },
  {
    title: 'Raporlar',
    path: '/admin/reports',
    icon: 'report',
    roles: [Role.ADMIN, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI],
  },
  {
    title: 'Envanter',
    path: '/admin/inventory',
    icon: 'inventory',
    submenu: [
      {
        title: 'Ekipmanlar',
        path: '/admin/inventory',
      },
      {
        title: 'Case Yönetimi',
        path: '/admin/cases',
      },
    ],
  },
  {
    title: 'Proje Yönetimi',
    path: '/admin/projects',
    icon: 'projects',
    submenu: [
      {
        title: 'Tüm Projeler',
        path: '/admin/projects',
      },
      {
        title: 'Yeni Proje Ekle',
        path: '/admin/projects/add',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI],
      },
    ],
  },
  {
    title: 'Takvim',
    path: '/admin/calendar',
    icon: 'calendar',
  },
  {
    title: 'Müşteriler',
    path: '/admin/clients',
    icon: 'clients',
    submenu: [
      {
        title: 'Tüm Müşteriler',
        path: '/admin/clients',
      },
      {
        title: 'Yeni Müşteri Ekle',
        path: '/admin/clients/add',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI],
      },
    ],
  },
  {
    title: 'Görevler',
    path: '/admin/tasks',
    icon: 'tasks',
    submenu: [
      {
        title: 'Tüm Görevler',
        path: '/admin/tasks',
      },
      {
        title: 'Bana Atananlar', // Yeni link
        path: '/admin/tasks?assignedToMe=true',
      },
      {
        title: 'Görev Ekle',
        path: '/admin/tasks/add',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI, Role.PROJE_YONETICISI],
      },
    ],
  },
  {
    title: 'Bildirimler',
    path: '/admin/notifications',
    icon: 'bell',
    submenu: [
      {
        title: 'Bildirim Merkezi',
        path: '/admin/notifications',
      },
      {
        title: 'Bildirim Ayarları',
        path: '/admin/notification-settings',
      },
    ],
  },
  {
    title: 'Aktivite Logları',
    path: '/admin/audit-logs',
    icon: 'document',
  },
  {
    title: 'Oturum Yönetimi',
    path: '/admin/sessions',
    icon: 'lock',
  },
  {
    title: 'Rapor Zamanlama',
    path: '/admin/report-schedules',
    icon: 'document',
  },
  {
    title: 'Kullanıcılar',
    path: '/admin/users',
    icon: 'users',
    roles: [Role.ADMIN, Role.FIRMA_SAHIBI],
    submenu: [
      {
        title: 'Tüm Kullanıcılar',
        path: '/admin/users',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI],
      },
      {
        title: 'Kullanıcı Ekle',
        path: '/admin/users/add',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI],
      },
      {
        title: 'Yetki Yönetimi',
        path: '/admin/permissions',
        roles: [Role.ADMIN, Role.FIRMA_SAHIBI],
      },
    ],
  },
  {
    title: 'Ayarlar',
    path: '/admin/settings',
    icon: 'settings',
  },
  {
    title: 'Masaüstü/Mobil',
    path: '/admin/downloads',
    icon: 'download',
  },
  {
    title: 'Webhooklar',
    path: '/admin/webhooks',
    icon: 'plug',
  },
  {
    title: 'Analytics',
    path: '/admin/analytics',
    icon: 'chart',
  },
  {
    title: 'Email Şablonları',
    path: '/admin/email-templates',
    icon: 'mail',
  },
  {
    title: '2FA Ayarları',
    path: '/admin/two-factor',
    icon: 'lock',
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [userRole, setUserRole] = useState<string>('');

  // Kullanıcı rolünü al
  useEffect(() => {
    setUserRole(getStoredUserRole());
  }, []);

  // Menu items filtering
  const menuItems = useMemo(() => {
    return initialMenuItems
      .filter(item => {
        // Eğer role kısıtlaması varsa kontrol et
        if (item.roles && item.roles.length > 0) {
          if (!userRole) return false; // Rol henüz yüklenmediyse gizle
          return item.roles.includes(userRole);
        }
        return true;
      })
      .map(item => {
        // Eğer alt menüsü varsa, alt menüleri de rollerine göre filtrele
        if (item.submenu) {
          return {
            ...item,
            submenu: item.submenu.filter(subItem => {
              if (subItem.roles && subItem.roles.length > 0) {
                if (!userRole) return false;
                return subItem.roles.includes(userRole);
              }
              return true;
            })
          };
        }
        return item;
      });
  }, [userRole]);

  const isActive = useCallback((path: string) => {
    if (path.includes('?')) {
      // Parametreli path kontrolü
      return pathname + window.location.search === path;
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }, [pathname]);

  // Pathname değiştiğinde aktif menüyü otomatik aç
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu && isActive(item.path)) {
        setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname, isActive, menuItems]);

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

      {/* Floating particles effect */}
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
                        <AdminIcon name={item.icon || 'dashboard'} className="w-5 h-5" />
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
                >
                  <span className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform hover:scale-110 relative z-10`}>
                    <AdminIcon name={item.icon || 'dashboard'} className="w-5 h-5" />
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
        <div className="text-center text-sm font-bold text-red-600 dark:text-red-500 mb-3 border-b border-red-200 dark:border-red-900/50 pb-3 uppercase bg-red-50 dark:bg-red-900/20 p-2 rounded tracking-widest border-2 border-red-500 shadow-md">
          Sürüm: v{process.env.NEXT_PUBLIC_APP_VERSION || 'Belirsiz'}
        </div>
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
            <AdminIcon name="logout" className="w-5 h-5" />
          </span>
          {!collapsed && <span className="font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
}
