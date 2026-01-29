'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Clock } from 'lucide-react';

export default function MaintenancePage() {
    return (
        // KURAL 1: Siyah-Beyaz Tema ve Footer Gizleme - fixed inset-0 z-[9999] bg-black
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white p-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl w-full text-center"
            >
                {/* KURAL 2: Logo Ekleme */}
                <div className="mb-12 flex justify-center">
                    <div className="relative h-20 w-48">
                        <Image
                            src="/images/sk-logo.png"
                            alt="SK Production Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Main Heading & Description */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Bakımdayız
                </h1>

                <div className="h-1 w-24 bg-white/20 mx-auto rounded-full mb-8" />

                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    Daha iyi hizmet verebilmek için sistemimizde kısa süreli bir güncelleme yapıyoruz.
                    Anlayışınız için teşekkür ederiz.
                </p>



                {/* KURAL 3 & 4: Sadece E-posta, Sabit Adres */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">Bize Ulaşın</p>
                    <a
                        href="mailto:info@skpro.com.tr"
                        className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                            <Mail className="w-5 h-5 text-gray-200" />
                        </div>
                        <span className="text-gray-200 text-lg font-medium group-hover:text-white transition-colors">
                            info@skpro.com.tr
                        </span>
                    </a>
                </div>

                {/* Animated dots for subtle activity indication */}
                <div className="mt-16 flex justify-center gap-2 opacity-30">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
