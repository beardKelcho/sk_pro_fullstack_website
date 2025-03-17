'use client';

import { Inter } from 'next/font/google';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

// Layout bileşenleri daha sonra oluşturulacak
// import AdminSidebar from '@/components/admin/AdminSidebar';
// import AdminHeader from '@/components/admin/AdminHeader';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Sidebar toggle fonksiyonu
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Login sayfası için farklı layout gösterme
  if (pathname === '/admin/login' || pathname === '/admin') {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${inter.className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${inter.className}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar collapsed={!sidebarOpen} onToggleCollapse={toggleSidebar} />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <AdminHeader onToggleSidebar={toggleSidebar} />
          
          {/* Page content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 