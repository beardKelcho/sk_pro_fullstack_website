'use client';

import dynamic from 'next/dynamic';

const CasesPageClient = dynamic(() => import('@/components/admin/cases/CasesPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0066CC] dark:border-primary-light" />
    </div>
  ),
});

export default function CasesPage() {
  return <CasesPageClient />;
}
