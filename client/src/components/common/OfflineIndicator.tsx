'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // İlk yüklemede online durumunu kontrol et
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Kısa bir süre sonra "wasOffline" durumunu sıfırla
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isOnline ? 'translate-y-0' : 'translate-y-0'
        }`}
    >
      <div
        className={`${isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          } px-4 py-2 text-center text-sm font-medium shadow-md`}
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Bağlantı yeniden kuruldu</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>İnternet bağlantısı yok. Offline mod aktif.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
