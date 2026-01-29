'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Film,
    Building2,
    Briefcase,
    Phone,
    Settings as SettingsIcon,
    Eye,
    EyeOff,
    Edit,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface SectionCard {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    lastUpdated?: string;
    isActive?: boolean;
    onClick: () => void;
}

export default function SiteManagementPage() {
    const queryClient = useQueryClient();
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Fetch all site content
    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['admin-site-content'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/admin/site-content`, {
                withCredentials: true,
            });
            return res.data.data;
        },
    });

    // Fetch maintenance mode status
    const { data: maintenanceData } = useQuery({
        queryKey: ['maintenance-status'],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/public/maintenance`);
            return res.data.data;
        },
    });

    // Toggle maintenance mode mutation
    const toggleMaintenanceMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(
                `${API_URL}/admin/settings/maintenance/toggle`,
                {},
                { withCredentials: true }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance-status'] });
            toast.success('Bakım modu güncellendi');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Bakım modu güncellenemedi');
        },
    });

    const isMaintenanceMode = maintenanceData?.isMaintenanceMode || false;

    const cards: SectionCard[] = [
        {
            id: 'maintenance',
            icon: <SettingsIcon className="w-12 h-12" />,
            title: 'Bakım Modu',
            description: isMaintenanceMode
                ? 'Site şu an bakım modunda - ziyaretçiler erişemiyor'
                : 'Site normal şekilde çalışıyor',
            onClick: () => toggleMaintenanceMutation.mutate(),
        },
        {
            id: 'hero',
            icon: <Film className="w-12 h-12" />,
            title: 'Hero Bölümü',
            description: 'Ana sayfa video, başlık ve slogan yönetimi',
            lastUpdated: siteContent?.find((s: any) => s.section === 'hero')?.updatedAt,
            isActive: siteContent?.find((s: any) => s.section === 'hero')?.isActive,
            onClick: () => setSelectedSection('hero'),
        },
        {
            id: 'about',
            icon: <Building2 className="w-12 h-12" />,
            title: 'Hakkımızda',
            description: 'Şirket bilgileri, istatistikler ve görseller',
            lastUpdated: siteContent?.find((s: any) => s.section === 'about')?.updatedAt,
            isActive: siteContent?.find((s: any) => s.section === 'about')?.isActive,
            onClick: () => setSelectedSection('about'),
        },
        {
            id: 'services',
            icon: <Briefcase className="w-12 h-12" />,
            title: 'Hizmetler',
            description: 'Sunulan hizmetler ve ekipman listesi',
            lastUpdated: siteContent?.find((s: any) => s.section === 'services')?.updatedAt,
            isActive: siteContent?.find((s: any) => s.section === 'services')?.isActive,
            onClick: () => setSelectedSection('services'),
        },
        {
            id: 'contact',
            icon: <Phone className="w-12 h-12" />,
            title: 'İletişim',
            description: 'İletişim bilgileri ve harita koordinatları',
            lastUpdated: siteContent?.find((s: any) => s.section === 'contact')?.updatedAt,
            isActive: siteContent?.find((s: any) => s.section === 'contact')?.isActive,
            onClick: () => setSelectedSection('contact'),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Site Yönetimi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Ana sayfa içeriklerini ve site ayarlarını yönetin
                    </p>
                </div>
            </div>

            {/* Maintenance Mode Banner */}
            {isMaintenanceMode && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-500 text-white p-4 rounded-lg flex items-center gap-3"
                >
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                        <p className="font-semibold">Site Bakım Modunda</p>
                        <p className="text-sm opacity-90">
                            Ziyaretçiler şu an siteye erişemez. Bakım modunu kapatmak için aşağıdaki kartı kullanın.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={card.onClick}
                        className={`
              relative p-6 rounded-xl border-2 cursor-pointer
              transition-all duration-300 hover:shadow-xl
              ${card.id === 'maintenance'
                                ? isMaintenanceMode
                                    ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-400'
                                    : 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400'
                                : card.isActive === false
                                    ? 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 opacity-60'
                                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-400'
                            }
            `}
                    >
                        {/* Icon */}
                        <div
                            className={`
                mb-4
                ${card.id === 'maintenance'
                                    ? isMaintenanceMode
                                        ? 'text-orange-600 dark:text-orange-400'
                                        : 'text-green-600 dark:text-green-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }
              `}
                        >
                            {card.icon}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {card.description}
                        </p>

                        {/* Meta Info */}
                        {card.id !== 'maintenance' && (
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {card.lastUpdated ? (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {new Date(card.lastUpdated).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-yellow-600">Henüz oluşturulmadı</span>
                                )}

                                <div className="flex items-center gap-1">
                                    {card.isActive ? (
                                        <>
                                            <Eye className="w-3 h-3 text-green-500" />
                                            <span>Aktif</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 text-gray-400" />
                                            <span>Pasif</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Maintenance Toggle Indicator */}
                        {card.id === 'maintenance' && (
                            <div className="mt-4 flex items-center justify-center">
                                <div
                                    className={`
                    w-16 h-8 rounded-full relative transition-colors
                    ${isMaintenanceMode
                                            ? 'bg-orange-500'
                                            : 'bg-green-500'
                                        }
                  `}
                                >
                                    <div
                                        className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full
                      transition-transform duration-300
                      ${isMaintenanceMode ? 'translate-x-9' : 'translate-x-1'}
                    `}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Edit Button (for content sections) */}
                        {card.id !== 'maintenance' && (
                            <div className="absolute top-4 right-4">
                                <Edit className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* TODO: Section Editor Modals */}
            {selectedSection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Düzenle
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Bu bölüm için içerik editörü yakında eklenecek...
                        </p>
                        <button
                            onClick={() => setSelectedSection(null)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
