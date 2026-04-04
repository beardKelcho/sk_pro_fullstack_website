'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/services/api/auth';
import logger from '@/utils/logger';
import { clearStoredAuth } from '@/utils/authStorage';

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await authApi.getProfile();

                if (!isMounted) return;

                if (response.data?.success && response.data?.user) {
                    router.replace('/admin/dashboard');
                    return;
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    logger.warn('Admin index auth check failed, redirecting to login.', error);
                }
            }

            if (!isMounted) return;

            clearStoredAuth();
            router.replace('/admin/login');
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
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
