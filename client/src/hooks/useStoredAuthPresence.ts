'use client';

import { useEffect, useState } from 'react';
import { getStoredUser } from '@/utils/authStorage';

export default function useStoredAuthPresence() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(getStoredUser()));
    };

    syncAuthState();

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || event.key === 'user' || event.key === 'accessToken') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:login', syncAuthState);
    window.addEventListener('auth:logout', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:login', syncAuthState);
      window.removeEventListener('auth:logout', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  return isAuthenticated;
}
