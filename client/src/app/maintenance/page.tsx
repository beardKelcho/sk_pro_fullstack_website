'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Mail, Phone } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 text-center"
                >
                    {/* Logo/Icon */}
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="inline-block mb-8"
                    >
                        <div className="w-24 h-24 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
                            <Settings className="w-12 h-12 text-blue-400" />
                        </div>
                    </motion.div>

                    {/* Main heading */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Site Bakımda
                    </h1>

                    <p className="text-xl md:text-2xl text-blue-200 mb-8">
                        Şu anda sistemimiz güncelleniyor
                    </p>

                    {/* Description */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8">
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            Daha iyi hizmet verebilmek için sistemimizde güncellemeler yapıyoruz.
                            Kısa süre içinde yeniden hizmette olacağız.
                        </p>

                        {/* Estimated time */}
                        <div className="flex items-center justify-center gap-2 text-blue-300">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Tahmini Süre: Birkaç saat</span>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm mb-4">
                            Acil durumlarda bize ulaşabilirsiniz:
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="mailto:info@skproduction.com.tr"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
                            >
                                <Mail className="w-4 h-4" />
                                <span>info@skproduction.com.tr</span>
                            </a>

                            <a
                                href="tel:+905555555555"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white border border-white/20"
                            >
                                <Phone className="w-4 h-4" />
                                <span>+90 555 555 55 55</span>
                            </a>
                        </div>
                    </div>

                    {/* Social Media Links (optional) */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-4">
                            Bizi Takip Edin
                        </p>
                        <div className="flex gap-4 justify-center">
                            {/* Add social media links here if needed */}
                        </div>
                    </div>

                    {/* Animated dots */}
                    <motion.div
                        className="mt-12 flex gap-2 justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-blue-400 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
