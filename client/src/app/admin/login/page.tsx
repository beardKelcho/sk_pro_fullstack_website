'use client';

import dynamic from 'next/dynamic';

const LoginPageClient = dynamic(() => import('@/components/admin/auth/LoginPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0066CC] dark:border-primary-light" />
    </div>
  ),
});

export default function LoginPage() {
  return <LoginPageClient />;
}
