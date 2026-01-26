'use client';

import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { motion } from 'framer-motion';
import { useSiteContent, AboutContent } from '@/hooks/useSiteContent';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import { useTranslations } from 'next-intl';

import { FALLBACK_CONTENT } from '@/data/fallbackContent';
// ... imports

const About = () => {
    const { useContent, resolveLocalized } = useSiteContent();
    const { data: aboutData } = useContent('about');

    const rawContent = aboutData?.content as AboutContent | undefined;
    const fallback = FALLBACK_CONTENT.about;

    const aboutContent: AboutContent = {
        title: {
            tr: rawContent?.title?.tr || fallback.title.tr,
            en: rawContent?.title?.en || fallback.title.en
        },
        description: {
            tr: rawContent?.description?.tr || fallback.description.tr,
            en: rawContent?.description?.en || fallback.description.en
        },
        stats: (rawContent?.stats && rawContent.stats.length > 0)
            ? rawContent.stats
            : fallback.stats,
        image: rawContent?.image || '',
    };

    const tHome = useTranslations('site.home');

    // Use stats directly from content (which is now guaranteed to have fallback)
    const displayStats = aboutContent.stats.map(s => ({
        label: resolveLocalized(s.label),
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
                                    title={resolveLocalized(aboutContent?.title) || tHome('aboutSection.title')}
                                    subtitle=""
                                />
                                {aboutContent?.description ? (
                                    <div className="text-gray-300 mb-8 text-lg whitespace-pre-line leading-relaxed">
                                        {resolveLocalized(aboutContent.description)}
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                                            {resolveLocalized(aboutContent?.description)}
                                        </p>
                                    </>
                                )}
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
                                    {(() => {
                                        const imgUrl = getImageUrl(aboutContent?.image);
                                        if (imgUrl) {
                                            return (
                                                <LazyImage
                                                    src={imgUrl}
                                                    alt="SK Production Ekibi"
                                                    className="relative rounded-2xl w-full aspect-[4/3] z-10"
                                                    fill
                                                    objectFit="cover"
                                                    sizes="(max-width: 768px) 100vw, 50vw"
                                                    quality={85}
                                                />
                                            );
                                        }
                                        return null;
                                    })()}
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
