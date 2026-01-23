'use client';

import React from 'react';
import ServiceCard from '@/components/common/ServiceCard';
import { motion } from 'framer-motion';

const Services = () => {
    const services = [
        {
            title: 'Uzman Ekip & Teknik Yönetim',
            description: "2017'den beri sektörün en karmaşık projelerinde 'teknik beyin' olarak yer alıyoruz. Sadece cihaz sağlamıyor, projenizin tüm görüntü mimarisini uçtan uca yönetiyoruz.",
            icon: 'screen' as const,
        },
        {
            title: 'Görüntü Rejisi & İşleme',
            description: "Analog Way Aquilon RS serisi ile çok katmanlı görüntü yönetimi. Dev LED ekranlarda 8K çözünürlüğe kadar sıfır gecikmeli ve kusursuz sinyal işleme.",
            icon: 'video' as const,
        },
        {
            title: 'Medya Server Çözümleri',
            description: "Dataton Watchout uzmanlığıyla milimetrik içerik senkronizasyonu. Devasa yüzeylerde ileri seviye mapping ve çoklu ekran yönetim çözümleri.",
            icon: 'led' as const,
        },
    ];

    return (
        <section id="services" className="py-24 bg-gradient-to-b from-[#0A1128] to-black relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Profesyonel Görüntü ve Medya Çözümleri
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Etkinlikleriniz için dünya standartlarında medya sunucuları, görüntü işleme teknolojileri ve uzman reji hizmetleri sunuyoruz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <ServiceCard
                                title={service.title}
                                description={service.description}
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
