'use client';

import dynamic from 'next/dynamic';

const WebVitals = dynamic(() => import('@/components/common/WebVitals').then((mod) => mod.WebVitals), { ssr: false });

interface GlobalClientShellProps {
  analyticsId?: string;
}

export default function GlobalClientShell({ analyticsId }: GlobalClientShellProps) {
  return (
    <>
      {analyticsId ? <WebVitals analyticsId={analyticsId} /> : null}
    </>
  );
}
