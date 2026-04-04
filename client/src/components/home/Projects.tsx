'use client';

import React, { useState, useRef, useEffect } from 'react';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import Icon from '@/components/common/Icon';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';


export interface Project {
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

interface ProjectsProps {
    initialProjects?: Project[];
}

const ProjectMediaFallback = ({
    project,
    type,
}: {
    project: Project;
    type: 'photo' | 'video';
}) => (
    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_40%)]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            {project.category}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.18)]">
                <Icon name={type === 'video' ? 'play' : 'image'} className="h-10 w-10" />
            </div>
            <div className="mt-5 max-w-sm">
                <p className="text-lg font-semibold text-white md:text-xl">{project.title}</p>
                {project.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-300">{project.description}</p>
                ) : null}
            </div>
        </div>
    </div>
);

const Projects: React.FC<ProjectsProps> = ({ initialProjects = [] }) => {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    const projects: Project[] = initialProjects;
    const photoProjects = projects.filter(p => p.type === 'photo');
    const videoProjects = projects.filter(p => p.type === 'video');

    // Lightbox navigation
    const nextImage = React.useCallback(() => {
        if (!lightbox) return;
        setLightbox((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.images.length
            };
        });
    }, [lightbox]);

    const prevImage = React.useCallback(() => {
        if (!lightbox) return;
        setLightbox((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
            };
        });
    }, [lightbox]);

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
    }, [lightbox, selectedVideo, nextImage, prevImage]);

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

    if (projects.length === 0) {
        return null;
    }

    // Video hover handlers
    const handleVideoHover = (projectId: string, shouldPlay: boolean) => {
        const video = videoRefs.current.get(projectId);
        if (!video) return;

        if (shouldPlay) {
            video.muted = true;
            video.play().catch(() => undefined);
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
                            <Icon name="image" className="w-5 h-5 inline-block mr-2" />
                            Fotoğraflar
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${activeTab === 'videos'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                }`}
                        >
                            <Icon name="play" className="w-5 h-5 inline-block mr-2" />
                            Videolar
                        </button>
                    </div>



                    {/* Photo Tab */}
                    {activeTab === 'photos' && (
                        <div
                            key="photos"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                                {photoProjects.length === 0 ? (
                                    <div className="col-span-full text-center py-32 text-gray-400">
                                        Henüz fotoğraf albümü eklenmemiş.
                                    </div>
                                ) : (
                                    photoProjects.map((project, index) => (
                                        <div
                                            key={project._id}
                                            className={`group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-all duration-500 ${
                                                project.coverUrl || project.imageUrls?.[0]
                                                    ? 'cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10'
                                                    : 'cursor-default'
                                            }`}
                                            style={{ transitionDelay: `${index * 60}ms` }}
                                            onClick={() => {
                                                if (!(project.coverUrl || project.imageUrls?.[0])) {
                                                    return;
                                                }

                                                setLightbox({
                                                    images: project.imageUrls || [project.coverUrl || ''],
                                                    currentIndex: 0,
                                                    title: project.title
                                                });
                                            }}
                                        >
                                            {/* Cover Image */}
                                            {project.coverUrl || project.imageUrls?.[0] ? (
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
                                                            <Icon name="image" className="w-3 h-3" />
                                                            {project.imageUrls.length} Fotoğraf
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="text-center">
                                                            <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/90 flex items-center justify-center backdrop-blur-sm mb-2">
                                                                <Icon name="image" className="w-8 h-8 text-white" />
                                                            </div>
                                                            <p className="text-white font-semibold">Galeriyi Görüntüle</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <ProjectMediaFallback project={project} type="photo" />
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
                                        </div>
                                    ))
                                )}
                        </div>
                    )}

                    {/* Video Tab */}
                    {activeTab === 'videos' && (
                        <div
                            key="videos"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                                {videoProjects.length === 0 ? (
                                    <div className="col-span-full text-center py-32 text-gray-400">
                                        Henüz video prodüksiyonu eklenmemiş.
                                    </div>
                                ) : (
                                    videoProjects.map((project, index) => (
                                        <div
                                            key={project._id}
                                            className={`group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-all duration-500 ${
                                                project.videoUrl ? 'cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10' : 'cursor-default'
                                            }`}
                                            style={{ transitionDelay: `${index * 60}ms` }}
                                            onMouseEnter={() => {
                                                if (project.videoUrl) {
                                                    handleVideoHover(project._id, true);
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                if (project.videoUrl) {
                                                    handleVideoHover(project._id, false);
                                                }
                                            }}
                                            onClick={() => {
                                                if (!project.videoUrl) {
                                                    return;
                                                }

                                                setSelectedVideo({ url: project.videoUrl, title: project.title });
                                            }}
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
                                                ) : project.coverUrl ? (
                                                    <div className="relative w-full h-full">
                                                        <NextImage
                                                            src={project.coverUrl}
                                                            alt={project.title}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, 400px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <ProjectMediaFallback project={project} type="video" />
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                                {project.videoUrl ? (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                        <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center backdrop-blur-sm">
                                                            <Icon name="play" className="w-10 h-10 text-white ml-2" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 backdrop-blur-sm">
                                                        Yakında
                                                    </div>
                                                )}
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
                                        </div>
                                    ))
                                )}
                        </div>
                    )}
                </div>

                {/* Lightbox & Video Modal Integration */}
                <AnimatePresence>
                    {lightbox && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
                            onClick={() => setLightbox(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-6xl flex flex-col items-center justify-center gap-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-2 text-white">
                                    <div className="flex flex-col">
                                        <h4 className="text-lg font-bold leading-none">{lightbox.title}</h4>
                                        {lightbox.images.length > 1 && (
                                            <span className="text-xs text-gray-400 mt-1">
                                                Görsel {lightbox.currentIndex + 1} / {lightbox.images.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setLightbox(null)}
                                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 active:scale-95 group focus:outline-none"
                                    >
                                        <Icon name="close" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/* Main Image Container */}
                                <div
                                    key={lightbox.currentIndex}
                                    className="relative w-full h-[75vh] sm:h-[80vh] flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden shadow-2xl border border-white/5"
                                >
                                    <NextImage
                                        src={lightbox.images[lightbox.currentIndex]}
                                        alt={`${lightbox.title} - ${lightbox.currentIndex + 1}`}
                                        fill
                                        unoptimized
                                        sizes="100vw"
                                        className="object-contain"
                                        priority
                                    />

                                    {/* Navigation Overlay Arrows (Desktop) */}
                                    {lightbox.images.length > 1 && (
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    prevImage();
                                                }}
                                                className="pointer-events-auto p-4 rounded-full bg-black/40 hover:bg-blue-600/80 text-white backdrop-blur-sm transition-all border border-white/10 hover:scale-110 group focus:outline-none"
                                            >
                                                <Icon name="arrow-left" className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    nextImage();
                                                }}
                                                className="pointer-events-auto p-4 rounded-full bg-black/40 hover:bg-blue-600/80 text-white backdrop-blur-sm transition-all border border-white/10 hover:scale-110 group focus:outline-none"
                                            >
                                                <Icon name="arrow-right" className="w-6 h-6 group-active:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail indicators (Mobile / Small dots) */}
                                {lightbox.images.length > 1 && (
                                    <div className="flex gap-2 pb-2 overflow-x-auto max-w-full no-scrollbar">
                                        {lightbox.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setLightbox(prev => prev ? { ...prev, currentIndex: idx } : null)}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                    idx === lightbox.currentIndex 
                                                    ? 'bg-blue-500 w-6' 
                                                    : 'bg-white/20 hover:bg-white/40'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {selectedVideo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-lg p-4"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-5xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Video Header */}
                                <div className="absolute -top-14 left-0 right-0 flex items-center justify-between px-2">
                                    <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                        {selectedVideo.title}
                                    </h4>
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group active:scale-95"
                                    >
                                        <Icon name="close" className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                                    </button>
                                </div>

                                {/* Video Player with shadow effect */}
                                <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-white/10 bg-black aspect-video">
                                    <video
                                        src={selectedVideo.url}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    >
                                        Tarayıcınız video oynatmayı desteklemiyor.
                                    </video>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>            </section>
        </StageExperience>
    );
};

export default Projects;
