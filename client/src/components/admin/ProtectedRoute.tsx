'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/services/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'TECHNICIAN' | 'INVENTORY_MANAGER' | 'USER';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Token kontrolü - hem localStorage hem sessionStorage'dan kontrol et
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          router.push('/admin');
          return;
        }

        // Profil bilgilerini kontrol et
        const response = await authApi.getProfile();
        
        if (response.data.success && response.data.user) {
          const user = response.data.user;
          
          // Rol kontrolü
          if (requiredRole) {
            const roleHierarchy: Record<string, number> = {
              'USER': 1,
              'TECHNICIAN': 2,
              'INVENTORY_MANAGER': 3,
              'ADMIN': 4
            };
            
            const userRoleLevel = roleHierarchy[user.role] || 0;
            const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
            
            if (userRoleLevel < requiredRoleLevel) {
              router.push('/admin/forbidden');
              return;
            }
          }
          
          // Kullanıcı aktif değilse
          if (!user.isActive) {
            router.push('/admin');
            return;
          }
          
          setIsAuthenticated(true);
        } else {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Hem localStorage hem sessionStorage'dan temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    // Login sayfasında kontrol yapma
    if (pathname === '/admin' || pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    checkAuth();
  }, [router, pathname, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] dark:border-primary-light mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Login sayfası için direkt render et
  if (pathname === '/admin' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Diğer sayfalar için authentication kontrolü
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

