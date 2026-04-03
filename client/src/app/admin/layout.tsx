'use client';

import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { Providers } from '@/components/providers';
import { queryClient } from '@/lib/react-query';
const AdminSidebar = dynamic(() => import('@/components/admin/AdminSidebar'), {
  ssr: false,
  loading: () => <div className="hidden h-screen w-20 shrink-0 border-r border-white/10 bg-white/40 dark:bg-gray-900/40 md:block" />,
});
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), {
  ssr: false,
  loading: () => <div className="h-16 border-b border-white/10 bg-white/40 dark:bg-gray-900/40" />,
});
const GlobalSearch = dynamic(() => import('@/components/admin/GlobalSearch'), { ssr: false });
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
const OfflineIndicator = dynamic(() => import('@/components/common/OfflineIndicator'), { ssr: false });
const Breadcrumb = dynamic(() => import('@/components/admin/Breadcrumb'), { ssr: false });
const ToastContainer = dynamic(() => import('react-toastify').then((mod) => mod.ToastContainer), { ssr: false });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const normalizedPathname = pathname?.replace(/\/$/, '') || '';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  // Sidebar toggle fonksiyonu
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Real-time (SSE): notifications/presence (admin panel)
  React.useEffect(() => {
    // Hook her render'da çalışmalı; login sayfalarında SSE'yi sadece no-op yapıyoruz
    if (normalizedPathname === '/admin/login' || normalizedPathname === '/admin') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    let cancelled = false;
    let disconnect: () => void = () => {
      /* no-op until SSE client loads */
    };

    void import('@/utils/sseClient').then(({ connectSse }) => {
      if (cancelled) return;

      disconnect = connectSse({
        url: `${apiUrl}/realtime/stream`,
        onEvent: (evt) => {
          if (evt.event === 'notification:new' && evt.data) {
            queryClient.invalidateQueries({ queryKey: ['notifications'] }).catch(() => undefined);
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] }).catch(() => undefined);

            const notificationData = typeof evt.data === 'object' && evt.data !== null
              ? evt.data as { title?: string; message?: string }
              : null;
            const title = notificationData?.title || 'Yeni bildirim';
            const message = notificationData?.message || '';
            toast.info(`${title}${message ? ` — ${message}` : ''}`, { autoClose: 4000 });
          }

          if (evt.event === 'monitoring:update') {
            queryClient.invalidateQueries({ queryKey: ['monitoring'], exact: false }).catch(() => undefined);
          }
        },
        onError: () => {
          // Sessiz: offline/back-end down senaryolarında panel çalışmaya devam etmeli
        },
      });
    }).catch(() => undefined);

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [normalizedPathname]);

  // Login sayfası için farklı layout gösterme - ProtectedRoute kullanma
  if (normalizedPathname === '/admin/login' || normalizedPathname === '/admin') {
    return (
      <Providers>
        <main className={`min-h-screen bg-gray-50 dark:bg-gray-900 font-sans`}>
          <ErrorBoundary>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </ErrorBoundary>
        </main>
      </Providers>
    );
  }

  // Diğer admin sayfaları için ProtectedRoute kullan
  return (
    <Providers>
      <ProtectedRoute>
        <ErrorBoundary>
          <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20
            dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans relative overflow-hidden`}>
            {/* Animated background */}
            <div className="fixed inset-0 gradient-animated opacity-5 dark:opacity-10 pointer-events-none" />

            {/* Floating orbs - Performans için azaltıldı */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-72 h-72 bg-[#0066CC]/5 rounded-full blur-3xl"
                style={{ animationDelay: '0s', animationDuration: '8s' }} />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00C49F]/5 rounded-full blur-3xl"
                style={{ animationDelay: '2s', animationDuration: '10s' }} />
            </div>

            <OfflineIndicator />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <div className="relative z-10 flex h-screen overflow-hidden">
              {/* Sidebar */}
              <AdminSidebar collapsed={!sidebarOpen} onToggleCollapse={toggleSidebar} />

              {/* Main content */}
              <div className="flex-1 overflow-auto">
                {/* Header */}
                <AdminHeader onToggleSidebar={toggleSidebar} onSearchClick={() => setSearchOpen(true)} />

                {/* Global Search */}
                {searchOpen && (
                  <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
                )}

                {/* Page content */}
                <main className="p-6">
                  <ErrorBoundary>
                    <div key={pathname} className="animate-in fade-in duration-200">
                      <Breadcrumb />
                      {children}
                    </div>
                  </ErrorBoundary>
                </main>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </ProtectedRoute>
    </Providers>
  );
}
