'use client';

import React from 'react';
import ServiceCard from '@/components/common/ServiceCard';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// STATIC CONTENT - No database dependency
const STATIC_SERVICES_CONTENT = {
    title: {
        tr: 'Profesyonel Görüntü ve Medya Çözümleri',
        en: 'Professional Visual and Media Solutions'
    },
    subtitle: {
        tr: 'Etkinlikleriniz için dünya standartlarında medya sunucuları, görüntü işleme teknolojileri ve uzman reji hizmetleri sunuyoruz.',
        en: 'We offer world-class media servers, image processing technologies and expert direction services for your events.'
    },
    services: [
        {
            title: { tr: 'Uzman Ekip & Teknik Yönetim', en: 'Expert Team & Technical Management' },
            description: { tr: "2017'den beri sektörün en karmaşık projelerinde 'teknik beyin' olarak yer alıyoruz.", en: "Since 2017, we have been the 'technical brain' in the most complex projects in the industry." },
            icon: 'screen' as const,
        },
        {
            title: { tr: 'Görüntü Rejisi & İşleme', en: 'Video Direction & Processing' },
            description: { tr: 'Analog Way Aquilon RS serisi ile çok katmanlı görüntü yönetimi.', en: 'Multi-layered image management with Analog Way Aquilon RS series.' },
            icon: 'video' as const,
        },
        {
            title: { tr: 'Medya Server Çözümleri', en: 'Media Server Solutions' },
            description: { tr: 'Dataton Watchout uzmanlığıyla milimetrik içerik senkronizasyonu.', en: 'Precision content synchronization with Dataton Watchout expertise.' },
            icon: 'led' as const,
        },
    ]
};

const Services = () => {
    const tHome = useTranslations('site.home');
    const locale = tHome('locale') === 'tr' ? 'tr' : 'en';

    return (
        <section id="services" className="py-24 bg-gradient-to-b from-[#0A1128] to-black relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6"
                    >
                        {STATIC_SERVICES_CONTENT.title[locale]}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                    >
                        {STATIC_SERVICES_CONTENT.subtitle[locale]}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STATIC_SERVICES_CONTENT.services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <ServiceCard
                                title={service.title[locale]}
                                description={service.description[locale]}
                                icon={service.icon}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
