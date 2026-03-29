'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getStoredUser } from '@/utils/authStorage';

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        /** Kullanıcı oturum kontrolü — localStorage token yerine güvenli authStorage kullan */
        const checkAuth = () => {
            const user = getStoredUser();

            if (user) {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/admin/login');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Yönlendiriliyor...</p>
            </div>
        </div>
    );
}
