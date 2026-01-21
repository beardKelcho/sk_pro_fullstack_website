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
        <section id="services" className="py-24 bg-white dark:bg-[#0A1128] transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Hizmetlerimiz & Çözümlerimiz
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Profesyonel görüntü teknolojileri ve teknik yönetim hizmetleri
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
