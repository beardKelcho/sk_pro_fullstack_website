'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import MaintenanceScreen from '@/components/layout/MaintenanceScreen';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const extractMaintenanceStatus = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value && typeof value === 'object' && 'isMaintenanceMode' in value) {
    return Boolean((value as { isMaintenanceMode?: unknown }).isMaintenanceMode);
  }

  return false;
};

export default function PublicMaintenanceGate() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname === '/maintenance') {
      setHasLoaded(true);
      return;
    }

    let isActive = true;

    const syncMaintenanceMode = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/public/maintenance`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!isActive) return;

        setIsMaintenanceMode(extractMaintenanceStatus(data?.data?.isMaintenanceMode));
      } catch {
        // Public site should stay usable if the maintenance probe fails.
      } finally {
        if (isActive) {
          setHasLoaded(true);
        }
      }
    };

    syncMaintenanceMode();
    const intervalId = window.setInterval(syncMaintenanceMode, 15000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [pathname]);

  if (!hasLoaded || !isMaintenanceMode) {
    return null;
  }

  return <MaintenanceScreen />;
}
