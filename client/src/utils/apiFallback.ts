// Backend çöktüğünde kullanılacak fallback veriler ve fonksiyonlar

export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 saniye timeout
    });
    return response.ok;
  } catch {
    return false;
  }
};

// LocalStorage'dan veri okuma (offline mode için)
export const getCachedData = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // 5 dakikadan eski cache'i kullanma
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch {
    // Cache okuma hatası, null döndür
  }
  
  return null;
};

// LocalStorage'a veri yazma
export const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // Cache yazma hatası, sessizce geç
  }
};

// Offline mode için queue (backend geri geldiğinde gönderilecek)
export const addToOfflineQueue = (action: string, data: any): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push({
      action,
      data,
      timestamp: Date.now(),
    });
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  } catch {
    // Queue yazma hatası
  }
};

// Offline queue'yu temizle
export const clearOfflineQueue = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('offline_queue');
};

