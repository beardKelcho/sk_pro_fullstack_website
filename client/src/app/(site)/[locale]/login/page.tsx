'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authApi } from '@/services/api/auth';
import { Button } from '@/components/ui/Button';
import PasswordInput from '@/components/ui/PasswordInput';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Main goal is to access admin dashboard
    // If 'from' param exists, we can still use it, otherwise default to admin dashboard
    const from = searchParams.get('from') || '/admin/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Lütfen tüm alanları doldurunuz.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ email, password });

            // 2FA Kontrolü (Backend destekliyorsa)
            if (response.data.requires2FA) {
                toast.info('2FA doğrulaması gerekiyor. (Henüz frontend\'de entegre değil)');
                // TODO: 2FA ekranına yönlendir
                return;
            }

            toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');

            // CRITICAL FIX: Save token to localStorage for ProtectedRoute
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Hızlı yönlendirme için
            router.push('/admin/dashboard');
            router.refresh(); // Router cache temizle

        } catch (err: any) {
            console.error('Login error:', err);
            const message = err.response?.data?.message || 'Giriş yapılırken bir hata oluştu.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800"
            >
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-xl bg-blue-600 shadow-lg">
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                            SK
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Admin Paneli
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Devam etmek için lütfen giriş yapın
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                E-posta Adresi
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                                placeholder="admin@skpro.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Şifre
                            </label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Beni hatırla
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Şifremi unuttum?
                            </a>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                        Giriş Yap
                    </Button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SK Production. Tüm hakları saklıdır.</p>
                </div>
            </motion.div>
        </div>
    );
}
