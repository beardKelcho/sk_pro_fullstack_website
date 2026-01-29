'use client';

import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { motion } from 'framer-motion';
import LazyImage from '@/components/common/LazyImage';
import { useTranslations } from 'next-intl';

// STATIC CONTENT - No database dependency
const STATIC_ABOUT_CONTENT = {
    title: {
        tr: 'Hakkımızda',
        en: 'About Us'
    },
    description: {
        tr: 'SK Production olarak 2010 yılından beri profesyonel görüntü ve ses sistemleri kiralama hizmeti vermekteyiz. Düğünlerden kurumsal etkinliklere, konserlerden spor müsabakalarına kadar geniş bir yelpazede hizmet sunuyoruz.\n\nDeneyimli ekibimiz ve son teknoloji ekipmanlarımız ile etkinliklerinizi unutulmaz kılıyoruz.',
        en: 'As SK Production, we have been providing professional video and audio systems rental services since 2010. We serve a wide range from weddings to corporate events, concerts to sports competitions.\n\nWith our experienced team and state-of-the-art equipment, we make your events unforgettable.'
    },
    stats: [
        { label: { tr: 'Yıllık Deneyim', en: 'Years Experience' }, value: '14+' },
        { label: { tr: 'Tamamlanan Proje', en: 'Completed Projects' }, value: '500+' },
        { label: { tr: 'Mutlu Müşteri', en: 'Happy Clients' }, value: '300+' }
    ],
    // Cloudinary image URL - replace with your actual working image URL
    image: 'https://res.cloudinary.com/dmeviky6f/image/upload/v1/about/team.jpg'
};

const About = () => {
    const tHome = useTranslations('site.home');
    const locale = tHome('locale') === 'tr' ? 'tr' : 'en'; // Get current locale

    const displayStats = STATIC_ABOUT_CONTENT.stats.map(s => ({
        label: s.label[locale],
        value: s.value
    }));

    return (
        <div style={{ marginTop: '16rem', marginBottom: '8rem' }}>
            <StageExperience>
                <section id="about" className="relative py-32 bg-gradient-to-b from-black/90 via-[#0A1128]/80 to-black/90" style={{ position: 'relative', scrollMarginTop: '100px', paddingTop: '8rem', minHeight: 'auto' }}>
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <motion.div
                                className="lg:w-1/2"
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <StageSectionTitle
                                    title={STATIC_ABOUT_CONTENT.title[locale]}
                                    subtitle=""
                                />
                                <div className="text-gray-300 mb-8 text-lg whitespace-pre-line leading-relaxed">
                                    {STATIC_ABOUT_CONTENT.description[locale]}
                                </div>
                                <div className="flex gap-8 flex-wrap justify-center lg:justify-start">
                                    {displayStats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            className="text-center"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <motion.span
                                                className="block text-5xl font-bold bg-gradient-to-r from-[#0066CC] to-[#00C49F] bg-clip-text text-transparent"
                                                animate={{
                                                    backgroundPosition: ['0%', '100%', '0%'],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                            >
                                                {stat.value}
                                            </motion.span>
                                            <span className="text-gray-400 text-sm mt-2 block">{stat.label}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                className="lg:w-1/2"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="relative">
                                    <motion.div
                                        className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-[#0066CC] to-[#00C49F] rounded-2xl blur-xl opacity-50"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.5, 0.7, 0.5],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                    {STATIC_ABOUT_CONTENT.image && (
                                        <LazyImage
                                            src={STATIC_ABOUT_CONTENT.image}
                                            alt="SK Production Ekibi"
                                            className="relative rounded-2xl w-full aspect-[4/3] z-10"
                                            fill
                                            objectFit="cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            quality={85}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </StageExperience>
        </div>
    );
};

export default About;
