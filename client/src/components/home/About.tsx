'use client';

import React from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import LazyImage from '@/components/common/LazyImage';
import { AboutContent } from '@/types/cms';
import { useInViewOnce } from '@/hooks/useInViewOnce';

interface AboutProps {
    content?: AboutContent;
}

const About: React.FC<AboutProps> = ({ content }) => {
    const [contentRef, isContentVisible] = useInViewOnce<HTMLDivElement>({ rootMargin: '-80px' });
    const [imageRef, isImageVisible] = useInViewOnce<HTMLDivElement>({ rootMargin: '-80px' });
    const imageSrc = content?.imageUrl || content?.image || '/images/sk-logo.png';
    const hasCustomImage = Boolean(content?.imageUrl || content?.image);

    if (!content) {
        return null;
    }

    return (
        <div style={{ marginTop: '16rem', marginBottom: '8rem' }}>
            <StageExperience>
                <section id="about" className="relative py-32 bg-transparent" style={{ position: 'relative', scrollMarginTop: '100px', paddingTop: '8rem', minHeight: 'auto' }}>
                    <div className="container mx-auto px-6">
                        <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 lg:p-12 border border-white/10 flex flex-col lg:flex-row items-center gap-16">
                            <div
                                ref={contentRef}
                                className={`lg:w-1/2 transition-all duration-700 ease-out ${
                                    isContentVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                                }`}
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
                                        {content.stats.map((stat, index: number) => (
                                            <div
                                                key={index}
                                                className={`text-center transition-all duration-500 ease-out ${
                                                    isContentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                                }`}
                                                style={{ transitionDelay: `${index * 90}ms` }}
                                            >
                                                <div className="text-4xl font-bold text-[#0066CC] mb-2">
                                                    {stat.value}
                                                </div>
                                                <div className="text-sm text-gray-400 uppercase tracking-wider">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Image */}
                            <div
                                ref={imageRef}
                                className={`lg:w-1/2 transition-all duration-700 ease-out ${
                                    isImageVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                                }`}
                            >
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0066CC]/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                    <LazyImage
                                        src={imageSrc}
                                        alt="SK Production Team"
                                        className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${
                                            hasCustomImage ? 'object-cover' : 'object-contain p-12 bg-black/60'
                                        }`}
                                        fill
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </StageExperience>
        </div>
    );
};

export default About;
