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
            {/* ÜST BAŞLIK - KÜÇÜK VE SABİT */}
            <div className="mb-4">
                <p className="text-sm md:text-base font-bold tracking-[0.3em] text-cyan-500 uppercase animate-pulse">
                    YARATICILIĞIN SINIRLARINI ZORLAYIN
                </p>
            </div>

            {/* ANA BAŞLIK - DÖNEN YAZILAR - ÇOK BÜYÜK */}
            <div className="h-32 md:h-48 flex items-center justify-center overflow-hidden w-full mb-6 relative">
                <AnimatePresence mode='wait'>
                    <motion.h1
                        key={textIndex}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-none tracking-tighter drop-shadow-2xl absolute w-full"
                    >
                        {slogans.length > 0 ? slogans[textIndex] : "Profesyonel Prodüksiyon Deneyimi"}
                    </motion.h1>
                </AnimatePresence>
            </div>

            {/* ALT BAŞLIK */}
            {subtitle && (
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed font-light mb-8">
                    {subtitle}
                </p>
            )}

            {/* CTA Butonlar */}
            <div className="flex gap-6 mt-4">
                <a
                    href="#projects"
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 hover:shadow-purple-500/40"
                >
                    Projelerimiz
                </a>
                <a
                    href="#contact"
                    className="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-bold rounded-full transition-all duration-300 border border-white/10 hover:border-white/30"
                >
                    İletişime Geç
                </a>
            </div>
        </section>
    );
}
