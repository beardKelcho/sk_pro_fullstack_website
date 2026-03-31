'use client';

import dynamic from 'next/dynamic';

const OfflineIndicator = dynamic(() => import('@/components/common/OfflineIndicator'), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/common/CommandPalette'), { ssr: false });
const WebVitals = dynamic(() => import('@/components/common/WebVitals').then((mod) => mod.WebVitals), { ssr: false });
const ToastContainer = dynamic(() => import('react-toastify').then((mod) => mod.ToastContainer), { ssr: false });

interface GlobalClientShellProps {
  analyticsId?: string;
}

export default function GlobalClientShell({ analyticsId }: GlobalClientShellProps) {
  return (
    <>
      <OfflineIndicator />
      <CommandPalette />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {analyticsId ? <WebVitals analyticsId={analyticsId} /> : null}
    </>
  );
}
