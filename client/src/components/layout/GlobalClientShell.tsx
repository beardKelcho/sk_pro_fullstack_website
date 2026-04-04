'use client';

import dynamic from 'next/dynamic';
import AdminShortcut from '@/components/admin/AdminShortcut';
import PublicMaintenanceGate from '@/components/layout/PublicMaintenanceGate';

const WebVitals = dynamic(() => import('@/components/common/WebVitals').then((mod) => mod.WebVitals), { ssr: false });

interface GlobalClientShellProps {
  analyticsId?: string;
}

export default function GlobalClientShell({ analyticsId }: GlobalClientShellProps) {
  return (
    <>
      <PublicMaintenanceGate />
      <AdminShortcut />
      {analyticsId ? <WebVitals analyticsId={analyticsId} /> : null}
    </>
  );
}
