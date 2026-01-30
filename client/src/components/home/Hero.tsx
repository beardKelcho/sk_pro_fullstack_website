'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
    content: any;
}

export default function Hero({ content }: HeroProps) {
    // DEBUG: Veriyi konsola yazdır (Tarayıcıda F12 -> Console sekmesinde görünecek)
    console.log('HERO COMPONENT RECEIVED:', content);

    // 1. DEFANSİF VERİ OKUMA:
    // Veri "content.data" içinde mi yoksa direkt "content"in kendisi mi? İkisini de dene.
    const rawData = content?.data || content;

    // Veri boşsa veya gerekli alanlar yoksa varsayılanları hazırla ama return etme (Debug için görelim)
    const title = rawData?.title || "SK Production";
    const subtitle = rawData?.subtitle || "";
    const videoUrl = rawData?.videoUrl || ""; // Video yoksa boş string
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
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* 1. ARKA PLAN VİDEOSU */}
            {videoUrl ? (
                <video
                    src={videoUrl}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            ) : (
                // Video yoksa arkada hafif bir grid veya gradient olsun ki boş olduğunu anlayalım
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-80" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* 2. İÇERİK */}
            <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-6 mt-10">

                {/* ANA BAŞLIK */}
                <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">
                    {title}
                </h1>

                {/* DÖNEN SLOGANLAR */}
                <div className="h-20 flex items-center justify-center overflow-hidden w-full">
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
                        ) : (
                            // Slogan yoksa boşluk
                            <p className="text-gray-600 text-sm">...</p>
                        )}
                    </AnimatePresence>
                </div>

                {/* ALT BAŞLIK */}
                {subtitle && (
                    <p className="text-gray-300 text-lg md:text-2xl max-w-3xl leading-relaxed opacity-90 font-light">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
}
