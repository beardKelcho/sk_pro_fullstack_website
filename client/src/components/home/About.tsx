'use client';

import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { motion } from 'framer-motion';
import LazyImage from '@/components/common/LazyImage';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { Loader2 } from 'lucide-react';

const About: React.FC = () => {
    // Fetch about data from CMS API
    const { data, isLoading } = useQuery({
        queryKey: ['about'],
        queryFn: async () => {
            const res = await axios.get('/cms/about');
            return res.data;
        },
    });

    const content = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!content) {
        return null;
    }

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
                                    title={content.title || 'Hakkımızda'}
                                    subtitle=""
                                />

                                <div className="mt-8 space-y-6">
                                    {(content.description || '').split('\n\n').map((paragraph: string, index: number) => (
                                        <p key={index} className="text-lg text-gray-300 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                {/* Stats */}
                                {content.stats && content.stats.length > 0 && (
                                    <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                                        {content.stats.map((stat: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                className="text-center"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                <div className="text-4xl font-bold text-[#0066CC] mb-2">
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-gray-400 uppercase tracking-wider">
                                                    {stat.label}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Image */}
                            <motion.div
                                className="lg:w-1/2"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                    {content.imageUrl && (
                                        <LazyImage
                                            src={content.imageUrl}
                                            alt="SK Production Team"
                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                            fill
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
