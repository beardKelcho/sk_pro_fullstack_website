'use client';

import { QueryClient } from '@tanstack/react-query';

// QueryClient instance oluştur
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache süresi: 5 dakika
      staleTime: 5 * 60 * 1000,
      // Cache'de tutma süresi: 10 dakika
      gcTime: 10 * 60 * 1000, // eski cacheTime yerine gcTime
      // Otomatik refetch
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Retry ayarları
      retry: (failureCount, error: any) => {
        // Network hatası için 3 kez dene
        if (error?.isNetworkError) {
          return failureCount < 3;
        }
        // 4xx hataları için retry yapma
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Diğer hatalar için 1 kez dene
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Mutation retry ayarları
      retry: false,
      // Hata durumunda toast göster (toast burada değil, component'te)
    },
  },
});

