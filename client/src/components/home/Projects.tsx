'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { Play, X, Loader2 } from 'lucide-react';

const Projects = () => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // Fetch projects from API
    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['showcase-projects'],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://sk-pro-backend.onrender.com/api'}/showcase-projects`);
            return res.data;
        },
    });

    const projects = projectsData?.data || [];

    return (
        <StageExperience>
            <section id="projects" className="relative py-24 bg-black overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title="Gerçekleşen Prodüksiyonlarımız"
                        subtitle="Konser, Festival ve Kurumsal Etkinliklerde Yarattığımız Profesyonel Çözümler"
                    />

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && projects.length === 0 && (
                        <div className="col-span-full py-32 text-center text-gray-400">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-6">
                                <Play className="w-12 h-12 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2 text-gray-200">Projelerimiz Yükleniyor</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Yakında burada gerçekleştirdiğimiz etkinlikleri görebileceksiniz.
                            </p>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {!isLoading && projects.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            {projects.map((project: any, index: number) => (
                                <motion.div
                                    key={project._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-blue-500/50 transition-all duration-500 cursor-pointer"
                                    onClick={() => project.videoUrl && setSelectedVideo(project.videoUrl)}
                                >
                                    {/* Cover Image */}
                                    {project.coverUrl && (
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={project.coverUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                            {/* Play Button (only if video exists) */}
                                            {project.videoUrl && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="w-16 h-16 rounded-full bg-blue-600/90 flex items-center justify-center backdrop-blur-sm">
                                                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Category Badge */}
                                        <div className="inline-block px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-600/30">
                                            {project.category}
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {project.title}
                                        </h3>

                                        {/* Description */}
                                        {project.description && (
                                            <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Technical Accent Line */}
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Video Modal */}
                <AnimatePresence>
                    {selectedVideo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="relative w-full max-w-6xl aspect-video"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>

                                {/* Video Player */}
                                <video
                                    src={selectedVideo}
                                    controls
                                    autoPlay
                                    className="w-full h-full rounded-xl shadow-2xl"
                                >
                                    Tarayıcınız video oynatmayı desteklemiyor.
                                </video>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </StageExperience>
    );
};

export default Projects;
