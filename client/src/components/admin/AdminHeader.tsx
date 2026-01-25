'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClickOutside } from '@/hooks/useClickOutside';
import { authApi } from '@/services/api/auth';
import { User } from '@/types/auth';
import logger from '@/utils/logger';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
  type Notification,
} from '@/services/notificationService';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onSearchClick?: () => void;
}

export default function AdminHeader({ onToggleSidebar, onSearchClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Ref'ler
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  // Click-outside handlers
  useClickOutside(profileMenuRef, () => setShowProfileMenu(false));
  useClickOutside(notificationPanelRef, () => setShowNotificationPanel(false));

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          logger.error('User data parse error:', error);
        }
      }
    };
    loadUser();
  }, []);

  // Route değişiminde açık popupları kapat
  useEffect(() => {
    setShowNotificationPanel(false);
    setShowProfileMenu(false);
  }, [pathname]);

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

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notificationList, isLoading: notificationsLoading } = useNotifications({ page: 1, limit: 10 });
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const notifications: Notification[] = notificationList?.notifications || [];

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      logger.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    try {
      if (!n.read) {
        await markAsReadMutation.mutateAsync(n._id);
      }
    } finally {
      setShowNotificationPanel(false);
    }
  };

  return (
    <header className="h-16 glass dark:glass-dark shadow-lg border-b border-white/20 dark:border-white/10 flex items-center justify-between px-4 md:px-6 relative z-50 backdrop-blur-xl">
      {/* Sol bölüm */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 
            focus:outline-none transition-all duration-300 hover:scale-110 focus:scale-110 hover-glow"
          onClick={onToggleSidebar}
          aria-label="Menüyü aç/kapat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="ml-4 text-lg font-bold text-gradient">
          {getPageTitle()}
        </h1>
      </div>

      {/* Sağ bölüm */}
      <div className="flex items-center space-x-3">
        {/* Arama butonu */}
        <button
          onClick={onSearchClick}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 
            relative group transition-all duration-300 hover:scale-110 focus:scale-110 hover-glow"
          title="Ara (Ctrl+K)"
          aria-label="Arama"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 glass dark:glass-dark rounded-md 
            text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            ⌘K
          </span>
        </button>

        {/* Bildirimler */}
        <div className="relative" ref={notificationPanelRef}>
          <button
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 
              relative transition-all duration-300 hover:scale-110 focus:scale-110 hover-glow"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            aria-label="Bildirimler"
            aria-expanded={showNotificationPanel}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            {/* Bildirim sayısı */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full 
                w-5 h-5 flex items-center justify-center font-bold shadow-lg pulse-glow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Bildirim paneli */}
          {showNotificationPanel && (
            <div className="absolute right-0 mt-2 w-80 glass dark:glass-dark rounded-2xl shadow-2xl overflow-hidden z-50 
              border border-white/20 dark:border-white/10 backdrop-blur-xl slide-in-right">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 dark:text-white">Bildirimler</h3>
                <button
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                  onClick={handleMarkAllAsRead}
                >
                  Tümünü Okundu İşaretle
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notificationsLoading ? (
                  <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    Yükleniyor...
                  </p>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          } ${markAsReadMutation.isPending ? 'opacity-80' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
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
                              {formatRelativeTime(notification.createdAt)}
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
                  onClick={() => setShowNotificationPanel(false)}
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
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 
              transition-all duration-300 hover:scale-105 focus:scale-105 hover-glow"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Profil menüsü"
            aria-expanded={showProfileMenu}
          >
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || 'Kullanıcı'}
            </span>
            <svg className="w-4 h-4 hidden md:block text-gray-600 dark:text-gray-400 transition-transform"
              style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profil açılır menüsü */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 glass dark:glass-dark rounded-2xl shadow-2xl overflow-hidden z-50 
              border border-white/20 dark:border-white/10 backdrop-blur-xl slide-in-right">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name || 'Kullanıcı'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{user?.email || 'email@example.com'}</p>
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
                  onClick={async () => {
                    try {
                      await authApi.logout();
                    } catch (error) {
                      logger.error('Logout error:', error);
                    } finally {
                      // Hem localStorage hem sessionStorage'dan temizle
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('user');
                      sessionStorage.removeItem('accessToken');
                      sessionStorage.removeItem('user');
                      window.location.href = '/admin';
                    }
                  }}
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