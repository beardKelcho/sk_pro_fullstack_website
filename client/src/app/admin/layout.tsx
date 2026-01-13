'use client';

import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import GlobalSearch from '@/components/admin/GlobalSearch';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import Breadcrumb from '@/components/admin/Breadcrumb';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
  
  // Login sayfası için farklı layout gösterme - ProtectedRoute kullanma
  if (pathname === '/admin/login' || pathname === '/admin') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${inter.className}`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    );
  }

  // Diğer admin sayfaları için ProtectedRoute kullan
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20 
          dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 ${inter.className} relative overflow-hidden`}>
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
          <div className="flex h-screen overflow-hidden relative z-10">
            {/* Sidebar */}
            <AdminSidebar collapsed={!sidebarOpen} onToggleCollapse={toggleSidebar} />

            {/* Main content */}
            <div className="flex-1 overflow-auto">
              {/* Header */}
              <AdminHeader onToggleSidebar={toggleSidebar} onSearchClick={() => setSearchOpen(true)} />
              
              {/* Global Search */}
              <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
              
              {/* Page content */}
              <div className="p-6">
                <ErrorBoundary>
                  <Breadcrumb />
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </ProtectedRoute>
  );
} 