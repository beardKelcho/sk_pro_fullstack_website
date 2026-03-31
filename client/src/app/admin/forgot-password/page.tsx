'use client';

import dynamic from 'next/dynamic';

const ForgotPasswordPageClient = dynamic(() => import('@/components/admin/auth/ForgotPasswordPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0066CC] dark:border-primary-light" />
    </div>
  ),
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
