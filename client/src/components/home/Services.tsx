'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { Monitor, Server, Cpu, Layers, Activity } from 'lucide-react';

// Icon mapping for Lucide icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Monitor,
    Server,
    Cpu,
    Layers,
    Activity,
};

interface Service {
    _id: string;
    title: string;
    category: string;
    description?: string;
    icon: string;
    details: string[];
    order: number;
    isActive: boolean;
}

const Services: React.FC = () => {
    // Fetch services from API
    const { data: servicesData, isLoading } = useQuery({
        queryKey: ['services-public'],
        queryFn: async () => {
            const res = await axios.get('/services');
            return res.data;
        },
    });

    const services: Service[] = servicesData?.data || [];

    // If no services, don't render the section
    if (!isLoading && services.length === 0) {
        return null;
    }

    return (
        <StageExperience>
            <section id="services" className="relative py-24 bg-transparent overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title="Hizmetlerimiz & Ekipmanlarımız"
                        subtitle="Video Engineering ve Teknik Prodüksiyon Sistemleri"
                    />

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {/* Services Grid */}
                    {!isLoading && services.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                            {services.map((service) => {
                                // Get the icon component
                                const IconComponent = ICON_MAP[service.icon] || Monitor;

                                return (
                                    <div
                                        key={service._id}
                                        className="group relative bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)] hover:bg-black/60"
                                    >
                                        {/* Icon with Gradient Background */}
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                                            <IconComponent className="w-8 h-8 text-cyan-400" />
                                        </div>

                                        {/* Title & Category */}
                                        <div className="mb-4">
                                            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                                                {service.title}
                                            </h3>
                                            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                                                {service.category}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {service.description && (
                                            <p className="text-gray-400 text-sm leading-relaxed mb-5">
                                                {service.description}
                                            </p>
                                        )}

                                        {/* Technical Specifications */}
                                        {service.details && service.details.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                    Teknik Özellikler
                                                </div>
                                                <div className="space-y-2">
                                                    {service.details.map((detail, idx) => (
                                                        <div key={idx} className="flex items-start gap-2">
                                                            <span className="text-cyan-400 text-sm mt-0.5 flex-shrink-0">▸</span>
                                                            <span className="text-gray-300 text-sm font-mono leading-relaxed">
                                                                {detail}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-purple-600/0 group-hover:from-cyan-500/5 group-hover:to-purple-600/5 transition-all duration-500 pointer-events-none"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </StageExperience>
    );
};

export default Services;
