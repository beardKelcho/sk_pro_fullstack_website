'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
    content: any;
}

export default function Hero({ content }: HeroProps) {
    // Veritabanı yapısında content direkt data olabilir veya data property'si içinde olabilir.
    // Gelen veriyi normalize ediyoruz.
    const data = content?.data || content;
    const [textIndex, setTextIndex] = useState(0);

    const { videoUrl, title, subtitle, rotatingTexts } = data || {};
    const slogans = rotatingTexts || [];

    // Slogan Döngüsü
    useEffect(() => {
        if (slogans.length <= 1) return;
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % slogans.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slogans.length]);

    // Veri yoksa güvenli çıkış
    if (!data) return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* 1. ARKA PLAN VİDEOSU (Cloudinary) */}
            {videoUrl ? (
                <video
                    src={videoUrl}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            ) : (
                <div className="absolute inset-0 bg-zinc-900" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10" />

            {/* 2. İÇERİK */}
            <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-6 mt-10">
                <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">
                    {title || "SK Production"}
                </h1>

                <div className="h-20 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode='wait'>
                        {slogans.length > 0 ? (
                            <motion.p
                                key={textIndex}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5 }}
                                className="text-2xl md:text-4xl font-light text-blue-500"
                            >
                                {slogans[textIndex]}
                            </motion.p>
                        ) : null}
                    </AnimatePresence>
                </div>

                {subtitle && (
                    <p className="text-gray-300 text-lg md:text-2xl max-w-3xl leading-relaxed opacity-90 font-light">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
