'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api/axios';
import { toast } from 'react-toastify';
import { Calendar, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

const CalendarOAuthContent = () => {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({
        googleConnected: false,
        outlookConnected: false
    });

    useEffect(() => {
        fetchStatus();

        // Check if we are returning from an OAuth flow
        const code = searchParams.get('code');
        const state = searchParams.get('state') || searchParams.get('scope') || '';

        if (code) {
            if (state.includes('googleapis') || searchParams.has('prompt')) {
                handleCallback('google', code);
            } else if (state.includes('offline_access') || searchParams.has('session_state')) {
                handleCallback('outlook', code);
            }
        }
    }, [searchParams]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/calendar/status');
            setStatus(res.data);
        } catch (error) {
            console.error('Error fetching calendar status', error);
            toast.error('Bağlantı durumları alınamadı');
        } finally {
            setLoading(false);
        }
    };

    const handleCallback = async (provider: 'google' | 'outlook', code: string) => {
        setLoading(true);
        try {
            await api.post(`/calendar/${provider}/callback`, { code });
            toast.success(`${provider === 'google' ? 'Google' : 'Outlook'} başarıyla bağlandı`);

            // Clean up URL
            window.history.replaceState({}, document.title, '/admin/calendar/settings');
            await fetchStatus();
        } catch (error) {
            toast.error('Bağlantı işlemi başarısız oldu');
            setLoading(false);
        }
    };

    const connectProvider = async (provider: 'google' | 'outlook') => {
        try {
            const res = await api.get(`/calendar/${provider}/auth`);
            if (res.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            toast.error('Yetkilendirme URL alınamadı');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-primary-light" />
                    Takvim Entegrasyonları
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Projelerdeki atamalarınızı ve bakım süreçlerinizi kendi takviminizle senkronize edebilirsiniz.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Google Calendar */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Google Calendar</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Takvim Eşitlemesi (OAuth)</p>
                                </div>
                            </div>
                            {status.googleConnected && (
                                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Bağlı
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => connectProvider('google')}
                            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors flex justify-center items-center ${status.googleConnected
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-primary-light dark:hover:bg-primary'
                                }`}
                        >
                            {status.googleConnected ? 'Yeniden Yetkilendir' : 'Google İle Bağlan'}
                            {!status.googleConnected && <ExternalLink className="w-4 h-4 ml-2" />}
                        </button>
                    </div>

                    {/* Outlook Calendar */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.5 3L1.5 5.5v13L11.5 21V3z" fill="#0078D4" />
                                        <path d="M11.5 3v18H22.5V3H11.5z" fill="#28A8EA" />
                                        <path d="M7 13.5v-3h2v3H7zm11 0v-3h-6v3h6zm0-4.5v-3h-6v3h6z" fill="#FFF" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Outlook</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Microsoft Graph Eşitlemesi</p>
                                </div>
                            </div>
                            {status.outlookConnected && (
                                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Bağlı
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => connectProvider('outlook')}
                            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors flex justify-center items-center ${status.outlookConnected
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                    : 'bg-[#0078D4] text-white hover:bg-[#005A9E]'
                                }`}
                        >
                            {status.outlookConnected ? 'Yeniden Yetkilendir' : 'Outlook İle Bağlan'}
                            {!status.outlookConnected && <ExternalLink className="w-4 h-4 ml-2" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CalendarSettingsPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Takvim Ayarları</h1>
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            }>
                <CalendarOAuthContent />
            </Suspense>
        </div>
    );
}
