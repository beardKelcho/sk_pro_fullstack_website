'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import { Play, X, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';

interface Project {
    _id: string;
    type: 'photo' | 'video';
    title: string;
    category: string;
    description?: string;
    coverUrl?: string;
    imageUrls?: string[];
    videoUrl?: string;
    order: number;
}

interface LightboxState {
    images: string[];
    currentIndex: number;
    title: string;
}

const Projects = () => {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    // Fetch projects from API
    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['showcase-projects'],
        queryFn: async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://sk-pro-backend.onrender.com/api'}/showcase-projects`);
            return res.data;
        },
    });

    const projects: Project[] = projectsData?.data || [];
    const photoProjects = projects.filter(p => p.type === 'photo');
    const videoProjects = projects.filter(p => p.type === 'video');

    // Lightbox navigation
    const nextImage = () => {
        if (!lightbox) return;
        setLightbox({
            ...lightbox,
            currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
        });
    };

    const prevImage = () => {
        if (!lightbox) return;
        setLightbox({
            ...lightbox,
            currentIndex: (lightbox.currentIndex - 1 + lightbox.images.length) % lightbox.images.length
        });
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (lightbox) {
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'Escape') setLightbox(null);
            }
            if (selectedVideo && e.key === 'Escape') {
                setSelectedVideo(null);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [lightbox, selectedVideo]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (lightbox || selectedVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [lightbox, selectedVideo]);

    // Video hover handlers
    const handleVideoHover = (projectId: string, shouldPlay: boolean) => {
        const video = videoRefs.current.get(projectId);
        if (!video) return;

        if (shouldPlay) {
            video.muted = true;
            video.play().catch(() => { });
        } else {
            video.pause();
            video.currentTime = 0;
        }
    };

    return (
        <StageExperience>
            <section id="projects" className="relative py-24 bg-transparent overflow-hidden" style={{ scrollMarginTop: '100px' }}>
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title="Sahne Deneyimlerimiz"
                        subtitle="Konser, Festival ve Kurumsal Etkinliklerde Yarattığımız Profesyonel Çözümler"
                    />

                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mb-12 mt-8">
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${activeTab === 'photos'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                }`}
                        >
                            <ImageIcon className="w-5 h-5 inline-block mr-2" />
                            Fotoğraflar
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${activeTab === 'videos'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                }`}
                        >
                            <Play className="w-5 h-5 inline-block mr-2" />
                            Videolar
                        </button>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        </div>
                    )}

                    {/* Photo Tab */}
                    {!isLoading && activeTab === 'photos' && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {photoProjects.length === 0 ? (
                                    <div className="col-span-full text-center py-32 text-gray-400">
                                        Henüz fotoğraf albümü eklenmemiş.
                                    </div>
                                ) : (
                                    photoProjects.map((project, index) => (
                                        <motion.div
                                            key={project._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10"
                                            onClick={() => setLightbox({
                                                images: project.imageUrls || [project.coverUrl || ''],
                                                currentIndex: 0,
                                                title: project.title
                                            })}
                                        >
                                            {/* Cover Image */}
                                            {(project.coverUrl || project.imageUrls?.[0]) && (
                                                <div className="relative h-64 overflow-hidden">
                                                    <NextImage
                                                        src={project.coverUrl || project.imageUrls?.[0] || ''}
                                                        alt={project.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 400px"
                                                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                                    {/* Gallery Badge */}
                                                    {project.imageUrls && project.imageUrls.length > 1 && (
                                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-600/90 text-white text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
                                                            <ImageIcon className="w-3 h-3" />
                                                            {project.imageUrls.length} Fotoğraf
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="text-center">
                                                            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/90 flex items-center justify-center backdrop-blur-sm mb-2">
                                                                <ImageIcon className="w-8 h-8 text-white" />
                                                            </div>
                                                            <p className="text-white font-semibold">Galeriyi Görüntüle</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="inline-block px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-blue-600/30">
                                                    {project.category}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {project.title}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Video Tab */}
                    {!isLoading && activeTab === 'videos' && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="videos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {videoProjects.length === 0 ? (
                                    <div className="col-span-full text-center py-32 text-gray-400">
                                        Henüz video prodüksiyonu eklenmemiş.
                                    </div>
                                ) : (
                                    videoProjects.map((project, index) => (
                                        <motion.div
                                            key={project._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10"
                                            onMouseEnter={() => handleVideoHover(project._id, true)}
                                            onMouseLeave={() => handleVideoHover(project._id, false)}
                                            onClick={() => setSelectedVideo({ url: project.videoUrl || '', title: project.title })}
                                        >
                                            {/* Video Preview */}
                                            <div className="relative h-64 overflow-hidden bg-black">
                                                {project.videoUrl ? (
                                                    <video
                                                        ref={(el) => {
                                                            if (el) videoRefs.current.set(project._id, el);
                                                        }}
                                                        src={project.videoUrl}
                                                        poster={project.coverUrl}
                                                        preload="metadata"
                                                        loop
                                                        muted
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="relative w-full h-full">
                                                        <NextImage
                                                            src={project.coverUrl || ''}
                                                            alt={project.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 400px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                                {/* Play Button */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                    <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center backdrop-blur-sm">
                                                        <Play className="w-10 h-10 text-white ml-2" fill="white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="inline-block px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-purple-600/30">
                                                    {project.category}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {project.title}
                                                </h3>
                                                {project.description && (
                                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Lightbox for Photos */}
                <AnimatePresence>
                    {lightbox && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                            onClick={() => setLightbox(null)}
                        >
                            <div className="relative w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
                                {/* Close Button - Fixed to screen */}
                                <button
                                    onClick={() => setLightbox(null)}
                                    className="fixed top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all z-[110] backdrop-blur-md border border-white/20 group"
                                >
                                    <X className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
                                    <span className="sr-only">Kapat</span>
                                </button>

                                {/* Image */}
                                <motion.img
                                    key={lightbox.currentIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    src={lightbox.images[lightbox.currentIndex]}
                                    alt={`${lightbox.title} - ${lightbox.currentIndex + 1}`}
                                    className="w-full h-[80vh] object-contain rounded-xl"
                                />

                                {/* Navigation */}
                                {lightbox.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                                        >
                                            <ChevronLeft className="w-8 h-8 text-white" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                                        >
                                            <ChevronRight className="w-8 h-8 text-white" />
                                        </button>

                                        {/* Counter */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                                            {lightbox.currentIndex + 1} / {lightbox.images.length}
                                        </div>
                                    </>
                                )}

                                {/* Title */}
                                <div className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold">
                                    {lightbox.title}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                className="relative w-full max-w-6xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>

                                {/* Title */}
                                <div className="absolute -top-12 left-0 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold">
                                    {selectedVideo.title}
                                </div>

                                {/* Video Player */}
                                <video
                                    src={selectedVideo.url}
                                    controls
                                    autoPlay
                                    muted
                                    className="w-full aspect-video rounded-xl shadow-2xl bg-black"
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
