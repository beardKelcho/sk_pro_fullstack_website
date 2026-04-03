'use client';

import { useState, useEffect } from 'react';
import type { HeroContent } from '@/types/cms';

type HeroContentInput = HeroContent | { data?: HeroContent | null } | null | undefined;

const unwrapHeroContent = (value: HeroContentInput): HeroContent | undefined => {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    if (value && typeof value === 'object' && 'data' in value) {
        return value.data || undefined;
    }

    return value as HeroContent;
};

interface HeroProps {
    content?: HeroContentInput;
}

export default function Hero({ content }: HeroProps) {
    const rawData = unwrapHeroContent(content);
    const title = rawData?.title || "YARATICILIĞIN SINIRLARINI ZORLAYIN";
    const subtitle = rawData?.subtitle || "";
    const description = rawData?.description || "";
    const primaryButtonText = rawData?.buttonText || 'Projelerimiz';
    const primaryButtonLink = rawData?.buttonLink || '#projects';
    const slogans = rawData?.rotatingTexts || [];

    const [textIndex, setTextIndex] = useState(0);

    // Slogan Döngüsü
    useEffect(() => {
        if (slogans.length <= 1) return;
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % slogans.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slogans.length]);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* İçerik Container */}
            <div className="relative z-30 container mx-auto px-4 flex flex-col items-center justify-center h-full text-center">

                {/* DÖNEN YAZILAR - EN ÜSTTE - ORTA BOYUT */}
                <div className="h-12 md:h-16 flex items-center justify-center overflow-hidden w-full mb-4 relative">
                    <div
                        key={textIndex}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-500 uppercase tracking-widest absolute w-full text-center"
                    >
                        {slogans.length > 0 ? slogans[textIndex] : "Profesyonel Prodüksiyon"}
                    </div>
                </div>

                {/* ANA BAŞLIK - SABİT - BEYAZ */}
                <div className="mb-6">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black !text-white leading-none tracking-tight drop-shadow-2xl uppercase">
                        {title}
                    </h1>
                </div>

                {/* ALT BAŞLIK */}
                {subtitle && (
                    <p className="!text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed font-light mb-8 mx-auto drop-shadow-md">
                        {subtitle}
                    </p>
                )}

                {description && (
                    <p className="!text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed font-light mb-8 mx-auto drop-shadow-md">
                        {description}
                    </p>
                )}

                {/* CTA Butonlar */}
                <div className="flex flex-col sm:flex-row gap-6 mt-4">
                    <a
                        href={primaryButtonLink}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40"
                    >
                        {primaryButtonText}
                    </a>
                    <a
                        href="#contact"
                        className="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-full transition-all duration-300 border border-white/10 hover:border-white/30"
                    >
                        İletişime Geç
                    </a>
                </div>
            </div>
        </section>
    );
}
