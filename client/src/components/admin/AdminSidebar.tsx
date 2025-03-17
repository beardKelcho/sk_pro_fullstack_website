'use client';

import React, { useState } from 'react';
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
    ],
  },
  {
    title: 'Ayarlar',
    path: '/admin/settings',
    icon: <SettingsIcon />,
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (title: string) => {
    setOpenMenus({
      ...openMenus,
      [title]: !openMenus[title],
    });
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div 
      className={`h-screen bg-white dark:bg-gray-800 shadow-md transition-all duration-300 
        border-r border-gray-200 dark:border-gray-700 flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo ve başlık */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        {collapsed ? (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 bg-[#0066CC] dark:bg-primary-light rounded-full flex items-center justify-center text-white font-bold">
              SK
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#0066CC] dark:bg-primary-light rounded-full flex items-center justify-center text-white font-bold mr-3">
              SK
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">SK Admin</h1>
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
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    className={`
                      flex items-center w-full py-2 px-3 text-left
                      ${isActive(item.path) ? 'bg-gray-100 dark:bg-gray-700 text-[#0066CC] dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}
                      rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors
                    `}
                    onClick={() => toggleSubMenu(item.title)}
                  >
                    <span className="flex items-center">
                      <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </span>
                    {!collapsed && (
                      <span className="ml-auto">
                        <svg
                          className={`w-4 h-4 transition-transform ${openMenus[item.title] ? 'rotate-180' : ''}`}
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
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            href={subItem.path}
                            className={`
                              flex items-center py-2 px-3
                              ${isActive(subItem.path) ? 'text-[#0066CC] dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}
                              rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors
                            `}
                          >
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
                  className={`
                    flex items-center py-2 px-3
                    ${isActive(item.path) ? 'bg-gray-100 dark:bg-gray-700 text-[#0066CC] dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}
                    rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#0066CC] dark:hover:text-primary-light transition-colors
                  `}
                >
                  <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer menü öğeleri */}
      <div className="p-3 mt-auto border-t border-gray-200 dark:border-gray-700">
        <button
          className={`
            flex items-center w-full py-2 px-3 
            text-gray-700 dark:text-gray-300
            rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-colors
          `}
        >
          <span className={`${collapsed ? 'mx-auto' : 'mr-3'}`}><LogoutIcon /></span>
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
} 