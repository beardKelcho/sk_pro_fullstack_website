'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    Film,
    Building2,
    Briefcase,
    Phone,
    Eye,
    EyeOff,
    Edit,
    Clock,
    Tv
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';

const MaintenanceToggle = dynamic(() => import('@/components/admin/MaintenanceToggle'), {
    ssr: false,
    loading: () => (
        <div className="rounded-xl border-2 border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Bakim karti yukleniyor...
        </div>
    ),
});
const HeroSectionModal = dynamic(() => import('@/components/admin/modals/HeroSectionModal'), { ssr: false });
const ServicesSectionModal = dynamic(() => import('@/components/admin/modals/ServicesSectionModal'), { ssr: false });
const ProjectsSectionModal = dynamic(() => import('@/components/admin/modals/ProjectsSectionModal'), { ssr: false });
const AboutSectionModal = dynamic(() => import('@/components/admin/modals/AboutSectionModal'), { ssr: false });
const ContactSectionModal = dynamic(() => import('@/components/admin/modals/ContactSectionModal'), { ssr: false });

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
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Fetch all site content
    const { data: siteContent, isLoading } = useQuery({
        queryKey: ['admin-site-content'],
        queryFn: async () => {
            const res = await axios.get('/admin/site-content');
            return res.data.data;
        },
    });

    // Fetch services (independent from CMS)
    const { data: servicesData } = useQuery({
        queryKey: ['admin-services'],
        queryFn: async () => {
            const res = await axios.get('/services/admin/all');
            return res.data;
        },
    });

    const { data: projectsData } = useQuery({
        queryKey: ['admin-showcase-projects'],
        queryFn: async () => {
            const res = await axios.get('/showcase-projects/admin/all');
            return res.data;
        },
    });

    // Fetch Contact with site-content as canonical source and CMS as legacy fallback
    const { data: contactData } = useQuery({
        queryKey: ['admin-contact'],
        queryFn: async () => {
            const [siteContentResult, legacyResult] = await Promise.allSettled([
                axios.get('/admin/site-content'),
                axios.get('/cms/contact'),
            ]);

            const siteContentSections =
                siteContentResult.status === 'fulfilled' ? siteContentResult.value.data?.data || [] : [];
            const contactSection = siteContentSections.find((section: any) => section.section === 'contact');
            const siteContactData = contactSection?.data || {};
            const legacyContactData =
                legacyResult.status === 'fulfilled' ? legacyResult.value.data?.data || {} : {};

            return {
                data: {
                    address: siteContactData.address || legacyContactData.address || '',
                    phone: siteContactData.phone || legacyContactData.phone || '',
                    email: siteContactData.email || legacyContactData.email || '',
                    mapUrl: siteContactData.mapUrl || legacyContactData.mapUrl || '',
                    socialLinks: {
                        instagram: siteContactData.socialLinks?.instagram || legacyContactData.socialLinks?.instagram || '',
                        linkedin: siteContactData.socialLinks?.linkedin || legacyContactData.socialLinks?.linkedin || '',
                    },
                    updatedAt: contactSection?.updatedAt || legacyContactData.updatedAt,
                },
                section: contactSection,
            };
        },
    });

    const getSectionData = (section: string) => {
        return siteContent?.find((s: any) => s.section === section);
    };

    const aboutSection = getSectionData('about');
    const contactSection = contactData?.section || getSectionData('contact');
    const services = servicesData?.data || [];
    const projects = projectsData?.data || [];

    const cards: SectionCard[] = [
        // Note: Maintenance is now a separate component, handled outside the grid map or as a special case
        {
            id: 'hero',
            icon: <Film className="w-12 h-12" />,
            title: 'Hero Bölümü',
            description: 'Ana sayfa video, başlık ve slogan yönetimi',
            lastUpdated: getSectionData('hero')?.updatedAt,
            isActive: getSectionData('hero')?.isActive,
            onClick: () => setSelectedSection('hero'),
        },
        {
            id: 'about',
            icon: <Building2 className="w-12 h-12" />,
            title: 'Hakkımızda',
            description: 'Şirket bilgileri, istatistikler ve görseller',
            lastUpdated: aboutSection?.updatedAt,
            isActive: aboutSection?.isActive ?? true,
            onClick: () => setSelectedSection('about'),
        },
        {
            id: 'services',
            icon: <Briefcase className="w-12 h-12" />,
            title: 'Hizmetler',
            description: 'Sunulan hizmetler ve ekipman listesi',
            lastUpdated: services[0]?.updatedAt,
            isActive: services.some((service: any) => service.isActive !== false),
            onClick: () => setSelectedSection('services'),
        },
        {
            id: 'contact',
            icon: <Phone className="w-12 h-12" />,
            title: 'İletişim',
            description: 'İletişim bilgileri ve harita koordinatları',
            lastUpdated: contactData?.data?.updatedAt,
            isActive: contactSection?.isActive ?? true,
            onClick: () => setSelectedSection('contact'),
        },
        {
            id: 'projects',
            icon: <Tv className="w-12 h-12" />,
            title: 'Projeler',
            description: 'Konser, lansman ve etkinlik projeleri',
            lastUpdated: projects[0]?.updatedAt,
            isActive: projects.some((project: any) => project.isActive !== false),
            onClick: () => setSelectedSection('projects'),
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

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Maintenance Toggle Card (First item) */}
                <MaintenanceToggle />

                {/* 2. Content Sections */}
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        onClick={card.onClick}
                        style={{
                            animationDelay: `${index * 80}ms`,
                            animationFillMode: 'both',
                        }}
                        className={`
              relative p-6 rounded-xl border-2 cursor-pointer
              transition-all duration-300 hover:shadow-xl animate-in fade-in slide-in-from-bottom-2
              ${card.isActive === false
                                ? 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 opacity-60'
                                : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-blue-400'
                            }
            `}
                    >
                        {/* Icon */}
                        <div className="mb-4 text-blue-600 dark:text-blue-400">
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

                        <div className="absolute top-4 right-4">
                            <Edit className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals */}
            {selectedSection === 'hero' && (
                <HeroSectionModal
                    isOpen
                    onClose={() => setSelectedSection(null)}
                    initialData={getSectionData('hero')?.data || {}}
                />
            )}

            {selectedSection === 'projects' && (
                <ProjectsSectionModal
                    isOpen
                    onClose={() => setSelectedSection(null)}
                />
            )}

            {selectedSection === 'services' && (
                <ServicesSectionModal
                    isOpen
                    onClose={() => setSelectedSection(null)}
                />
            )}

            {selectedSection === 'about' && (
                <AboutSectionModal
                    isOpen
                    onClose={() => setSelectedSection(null)}
                />
            )}

            {selectedSection === 'contact' && (
                <ContactSectionModal
                    isOpen
                    onClose={() => setSelectedSection(null)}
                />
            )}

            {/* Placeholder for other modals */}
            {selectedSection && selectedSection !== 'hero' && selectedSection !== 'projects' && selectedSection !== 'services' && selectedSection !== 'about' && selectedSection !== 'contact' && (
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
