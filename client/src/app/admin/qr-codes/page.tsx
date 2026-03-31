'use client';

import dynamic from 'next/dynamic';

const QRCodeDetailClient = dynamic(() => import('@/components/admin/qr-codes/QRCodeDetailClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066CC] dark:border-primary"></div>
    </div>
  ),
});

export default function QRCodeDetailPage() {
  return <QRCodeDetailClient />;
}
