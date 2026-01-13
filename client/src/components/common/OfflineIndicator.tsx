'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Online/offline durumunu kontrol et
    const handleOnline = () => {
      setIsOnline(true);
      setShowWarning(false);
      toast.success('İnternet bağlantısı geri geldi');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowWarning(true);
      toast.warn('İnternet bağlantısı kesildi. Bazı özellikler çalışmayabilir.');
    };

    // Başlangıç durumunu kontrol et
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showWarning || isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>Çevrimdışı mod - Bazı özellikler sınırlı</span>
    </div>
  );
};

export default OfflineIndicator;

