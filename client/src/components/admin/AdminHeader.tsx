'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClickOutside } from '@/hooks/useClickOutside';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  
  // Ref'ler
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  
  // Click-outside handlers
  useClickOutside(profileMenuRef, () => setShowProfileMenu(false));
  useClickOutside(notificationPanelRef, () => setShowNotificationPanel(false));
  
  // Sayfa başlığını bulma
  const getPageTitle = () => {
    const path = pathname.split('/');
    const lastSegment = path[path.length - 1];
    
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'equipment': 'Ekipman Yönetimi',
      'maintenance': 'Bakım Takibi',
      'categories': 'Ekipman Kategorileri',
      'projects': 'Proje Yönetimi',
      'calendar': 'Proje Takvimi',
      'clients': 'Müşteriler',
      'tasks': 'Görevler',
      'users': 'Kullanıcılar',
      'settings': 'Ayarlar',
    };
    
    return titles[lastSegment] || 'SK Admin';
  };
  
  // Örnek bildirimler
  const notifications = [
    { id: 1, title: 'Bakım Hatırlatması', message: 'Analog Way Aquilon RS4 için planlanan bakım 2 gün sonra gerçekleşecek.', time: '2 saat önce', read: false },
    { id: 2, title: 'Yeni Proje Eklendi', message: 'Acme Corp Konferansı adlı yeni bir proje oluşturuldu.', time: '5 saat önce', read: false },
    { id: 3, title: 'Ekipman İadesi', message: 'Dataton Watchpax depoya geri döndü.', time: '1 gün önce', read: true },
  ];
  
  return (
    <header className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
      {/* Sol bölüm */}
      <div className="flex items-center">
        <button 
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          onClick={onToggleSidebar}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="ml-4 text-lg font-medium text-gray-800 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>
      
      {/* Sağ bölüm */}
      <div className="flex items-center space-x-3">
        {/* Arama butonu */}
        <button className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        {/* Bildirimler */}
        <div className="relative" ref={notificationPanelRef}>
          <button 
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {/* Bildirim sayısı */}
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* Bildirim paneli */}
          {showNotificationPanel && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 dark:text-white">Bildirimler</h3>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Tümünü Okundu İşaretle
                </button>
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <div className={`w-2 h-2 mt-1 rounded-full ${!notification.read ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Bildirim bulunmuyor
                  </p>
                )}
              </div>
              
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/admin/notifications"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline block text-center"
                >
                  Tüm Bildirimleri Görüntüle
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profil menüsü */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-8 h-8 bg-[#0066CC] dark:bg-primary-light rounded-full flex items-center justify-center text-white font-medium text-sm">
              YK
            </div>
            <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300">
              Yönetici
            </span>
            <svg className="w-4 h-4 hidden md:block text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Profil açılır menüsü */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Yönetici</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">admin@skproduction.com</p>
              </div>
              
              <div className="py-1">
                <Link 
                  href="/admin/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </Link>
                
                <Link 
                  href="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ayarlar
                </Link>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 