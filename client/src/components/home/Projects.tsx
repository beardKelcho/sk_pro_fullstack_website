'use client';

import React from 'react';
import { motion } from 'framer-motion';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import Icon from '@/components/common/Icon';

// STATIC TURKISH CONTENT
const PROJECTS_CONTENT = {
    title: 'Sahne Deneyimlerimiz',
    subtitle: 'Gerçekleştirdiğimiz etkinliklerde yarattığımız görsel şölenler'
};

const Projects = () => {
    return (
        <StageExperience>
            <section id="projects" className="relative py-24 bg-black overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title={PROJECTS_CONTENT.title}
                        subtitle={PROJECTS_CONTENT.subtitle}
                    />

                    {/* Geçici olarak boş durum gösteriliyor */}
                    <div className="col-span-full py-32 text-center text-gray-400">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-6">
                            <Icon name="video" className="w-12 h-12 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-2 text-gray-200">Projelerimiz Yükleniyor</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Site Yönetimi paneli aktif olduğunda bu bölümde projelerimizi görebileceksiniz.
                        </p>
                    </div>
                </div>
            </section>
        </StageExperience>
    );
};

export default Projects;
