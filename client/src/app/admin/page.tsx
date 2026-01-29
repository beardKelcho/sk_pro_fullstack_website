'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

            if (token) {
                // Token varsa dashboard'a yönlendir
                router.replace('/admin/dashboard');
            } else {
                // Token yoksa login sayfasına yönlendir
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
