'use client';

import logger from '@/utils/logger';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/services/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'FIRMA_SAHIBI' | 'PROJE_YONETICISI' | 'DEPO_SORUMLUSU' | 'TEKNISYEN';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Login sayfalarında hiçbir kontrol yapma - direkt render et
    if (pathname === '/admin' || pathname === '/admin/login') {
      setIsLoading(false);
      setIsAuthenticated(null);
      return;
    }

    let isMounted = true; // Component unmount kontrolü

    const checkAuth = async () => {
      try {
        // Token kontrolü - hem localStorage hem sessionStorage'dan kontrol et
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace('/admin'); // replace kullan, history'ye ekleme
            setIsLoading(false);
          }
          return;
        }

        // Profil bilgilerini kontrol et
        const response = await authApi.getProfile();

        if (!isMounted) return; // Component unmount olduysa devam etme

        // Debug: Response'u logla
        if (process.env.NODE_ENV === 'development') {
          logger.info('ProtectedRoute - Profile response:', response.data);
        }

        if (response.data && response.data.success && response.data.user) {
          const user = response.data.user;

          // Rol kontrolü
          if (requiredRole) {
            const roleHierarchy: Record<string, number> = {
              'TEKNISYEN': 1,
              'PROJE_YONETICISI': 2,
              'DEPO_SORUMLUSU': 2,
              'FIRMA_SAHIBI': 3,
              'ADMIN': 4
            };

            const userRoleLevel = roleHierarchy[user.role] || 0;
            const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

            if (userRoleLevel < requiredRoleLevel) {
              router.replace('/admin/forbidden');
              setIsLoading(false);
              return;
            }
          }

          // Kullanıcı aktif değilse
          if (!user.isActive) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            router.replace('/admin');
            setIsLoading(false);
            return;
          }

          // Authentication başarılı
          setIsAuthenticated(true);
          setIsLoading(false); // CRITICAL: Loading'i false yap, yoksa sürekli loading'de kalır!
        } else {
          // Token geçersiz, temizle ve login'e yönlendir
          if (isMounted) {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            router.replace('/admin');
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        // Hata durumunda sessizce login'e yönlendir (sürekli log spam'ini önle)
        if (process.env.NODE_ENV === 'development') {
          logger.error('Auth check failed:', { error, responseData: error.response?.data });
        }
        // Hem localStorage hem sessionStorage'dan temizle
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
        // Sadece bir kez yönlendir, döngüyü önle - replace kullan
        if (isMounted) {
          setIsAuthenticated(false);
          if (pathname !== '/admin' && pathname !== '/admin/login') {
            router.replace('/admin');
          }
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
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
  // isLoading false olduğunda ve isAuthenticated false ise null döndür
  // Bu, sürekli yönlendirme döngüsünü önler
  if (!isLoading && isAuthenticated === false) {
    return null;
  }

  // Authenticated ise children'ı render et
  if (isAuthenticated === true) {
    return <>{children}</>;
  }

  // Loading durumunda loading ekranı göster (zaten yukarıda handle edildi)
  return null;
}

