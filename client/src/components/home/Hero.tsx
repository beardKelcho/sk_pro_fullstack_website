'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
    content: any;
}

export default function Hero({ content }: HeroProps) {
    const rawData = content?.data || content;

    const title = rawData?.title || "SK Production";
    const subtitle = rawData?.subtitle || "";
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
            {/* İçerik - Video artık layout.tsx'te */}
            <div className="relative z-20 text-center px-4 max-w-6xl mx-auto flex flex-col items-center gap-8">

                {/* DÖNEN SLOGANLAR - ÜSTTEönce dinamik giriş */}
                <div className="h-16 flex items-center justify-center overflow-hidden w-full">
                    <AnimatePresence mode='wait'>
                        {slogans.length > 0 ? (
                            <motion.p
                                key={textIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6 }}
                                className="text-xl md:text-2xl lg:text-3xl font-light text-gray-300 tracking-wide"
                            >
                                {slogans[textIndex]}
                            </motion.p>
                        ) : null}
                    </AnimatePresence>
                </div>

                {/* ANA BAŞLIK - ALT - Vurucu ve büyük */}
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
                    Profesyonel <span className="text-cyan-500">Prodüksiyon</span> Deneyimi
                </h1>

                {/* ALT BAŞLIK */}
                {subtitle && (
                    <p className="text-gray-300 text-lg md:text-xl lg:text-2xl max-w-3xl leading-relaxed font-light">
                        {subtitle}
                    </p>
                )}

                {/* CTA Butonlar (Opsiyonel) */}
                <div className="flex gap-4 mt-6">
                    <a
                        href="#projects"
                        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                    >
                        Projelerimiz
                    </a>
                    <a
                        href="#contact"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold rounded-lg transition-all duration-300 border border-white/20"
                    >
                        İletişime Geç
                    </a>
                </div>
            </div>
        </section>
    );
}
