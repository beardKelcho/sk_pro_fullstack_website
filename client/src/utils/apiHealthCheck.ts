/**
 * API Health Check Utility
 * Backend API'nin erişilebilir olup olmadığını kontrol eder
 */

/**
 * Backend API'nin sağlık durumunu kontrol eder
 * @returns Promise<boolean> - API erişilebilirse true, değilse false
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const apiUrl = typeof window !== 'undefined'
      ? '/api/health'
      : (() => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');
        return `${backendUrl}/api/health`;
      })();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout için AbortController kullan
      signal: AbortSignal.timeout(5000), // 5 saniye timeout
    });

    return response.ok;
  } catch (error) {
    // Network hatası veya timeout
    if (process.env.NODE_ENV === 'development') {
      console.warn('API health check failed:', error);
    }
    return false;
  }
};

/**
 * Backend API URL'ini döndürür
 * Client-side'da relative path, server-side'da tam URL
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5001');
  return `${backendUrl}/api`;
};
