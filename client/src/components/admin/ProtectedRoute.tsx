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
  const normalizedPathname = pathname?.replace(/\/$/, '') || '';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Login sayfalarında hiçbir kontrol yapma - direkt render et
    if (normalizedPathname === '/admin' || normalizedPathname === '/admin/login') {
      setIsLoading(false);
      setIsAuthenticated(null);
      return;
    }

    let isMounted = true; // Component unmount kontrolü

    const checkAuth = async () => {
      try {
        // Auth durumu httpOnly cookie üzerinden API çağrısıyla belirlenir
        // localStorage/sessionStorage kullanılmıyor (XSS koruması)
        let user = null;
        const response = await authApi.getProfile();

        if (!isMounted) return;

        if (process.env.NODE_ENV === 'development') {
          logger.info('ProtectedRoute - Profile fetched:', response.data);
        }

        if (response.data && response.data.success && response.data.user) {
          user = response.data.user;
        }

        if (!isMounted) return;

        if (user) {
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
            router.replace('/admin');
            setIsLoading(false);
            return;
          }

          // Authentication başarılı
          setIsAuthenticated(true);
          setIsLoading(false); // CRITICAL: Loading'i false yap, yoksa sürekli loading'de kalır!
        } else {
          // Oturum geçersiz, login'e yönlendir
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace('/admin');
            setIsLoading(false);
          }
        }
      } catch (error: unknown) {
        // Hata durumunda sessizce login'e yönlendir
        if (process.env.NODE_ENV === 'development') {
          const axiosErr = error as { response?: { data?: unknown } };
          logger.error('Auth check failed:', { error, responseData: axiosErr.response?.data });
        }
        if (isMounted) {
          setIsAuthenticated(false);
          if (normalizedPathname !== '/admin' && normalizedPathname !== '/admin/login') {
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
  }, [router, pathname, normalizedPathname, requiredRole]);

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
  if (normalizedPathname === '/admin' || normalizedPathname === '/admin/login') {
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

