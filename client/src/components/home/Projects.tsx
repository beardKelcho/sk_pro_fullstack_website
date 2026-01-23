'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import LazyImage from '@/components/common/LazyImage';
import Icon from '@/components/common/Icon';
import { SiteImage } from '@/services/siteImageService';
import { getImageUrl } from '@/utils/imageUrl';
import { useTranslations } from 'next-intl';
import logger from '@/utils/logger';

// Extended type for local use until backend is updated
interface VideoProject extends SiteImage {
    previewVideo?: string;
    fullVideo?: string;
    description?: string;
}

// Sample placeholder videos
const PLACEHOLDER_VIDEOS = [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-technological-interface-32763-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-lines-27666-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-supercomputers-20531-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-rendering-of-a-ball-of-energy-26131-large.mp4',
];

const Projects = () => {
    const tHome = useTranslations('site.home');
    const [projects, setProjects] = useState<VideoProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
    const imagesFetchedRef = useRef(false);

    useEffect(() => {
        if (imagesFetchedRef.current) return;
        const fetchImages = async () => {
            try {
                const response = await fetch(`/api/site-images/public?category=project&isActive=true`, {
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (response.ok) {
                    const data = await response.json();
                    const images = (data.images || data || []);
                    const activeImages = images.filter((img: SiteImage) => {
                        if (!img.isActive || img.category !== 'project') return false;
                        if (!img.url && !img.path && !img.filename) return false;
                        return true;
                    });

                    // Enhance with dummy video data
                    const enhancedProjects = activeImages.map((img: SiteImage, index: number) => ({
                        ...img,
                        previewVideo: PLACEHOLDER_VIDEOS[index % PLACEHOLDER_VIDEOS.length],
                        fullVideo: PLACEHOLDER_VIDEOS[index % PLACEHOLDER_VIDEOS.length],
                        description: `Proje #${index + 1} - İleri Teknoloji Görüntü Çözümü`
                    }));

                    setProjects(enhancedProjects);
                    imagesFetchedRef.current = true;
                }
            } catch (error) {
                logger.error('Proje yükleme hatası:', error);
            }
        };
        fetchImages();
    }, []);

    // Hover logic for preview videos
    useEffect(() => {
        Object.entries(videoRefs.current).forEach(([id, video]) => {
            if (!video) return;

            if (id === hoveredProject) {
                video.currentTime = 0;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Auto-play might be blocked
                        logger.warn('Video play prevented:', error);
                    });
                }
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, [hoveredProject]);

    return (
        <StageExperience>
            <section id="projects" className="relative py-24 bg-black overflow-hidden"
                style={{ scrollMarginTop: '100px' }}>

                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title={tHome('projectsSection.title')}
                        subtitle={tHome('projectsSection.subtitle')}
                    />

                    {/* Masonry Grid */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project._id || project.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="break-inside-avoid"
                            >
                                <div
                                    className="relative group rounded-2xl overflow-hidden cursor-pointer bg-gray-900 shadow-lg hover:shadow-[0_0_30px_rgba(0,102,204,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                                    onClick={() => setSelectedProject(project)}
                                    onMouseEnter={() => setHoveredProject(project._id || project.id || '')}
                                    onMouseLeave={() => setHoveredProject(null)}
                                >
                                    {/* Aspect Ratio Container */}
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        {/* Cover Image */}
                                        <div className={`absolute inset-0 z-10 transition-opacity duration-500 ${hoveredProject === (project._id || project.id) ? 'opacity-0' : 'opacity-100'}`}>
                                            {(() => {
                                                const imageId = project._id || project.id;
                                                const imageUrl = getImageUrl({
                                                    image: project,
                                                    imageId: imageId as string,
                                                    fallback: project.url || project.path || ''
                                                });
                                                if (!imageUrl) return null;
                                                return (
                                                    <LazyImage
                                                        src={imageUrl}
                                                        alt={project.originalName || 'Project Cover'}
                                                        className="w-full h-full object-cover"
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                );
                                            })()}
                                        </div>

                                        {/* Preview Video */}
                                        <video
                                            ref={el => {
                                                if (project._id || project.id) {
                                                    videoRefs.current[project._id || project.id || ''] = el;
                                                }
                                            }}
                                            src={project.previewVideo}
                                            className="absolute inset-0 w-full h-full object-cover z-0"
                                            muted
                                            loop
                                            playsInline
                                        />

                                        {/* Overlay Content */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="bg-[#0066CC] w-10 h-10 rounded-full flex items-center justify-center mb-3">
                                                    <Icon name="video" className="text-white w-5 h-5" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{project.originalName}</h3>
                                                <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Lightbox / Video Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
                            onClick={() => setSelectedProject(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    <Icon name="close" className="w-6 h-6" />
                                </button>

                                <video
                                    src={selectedProject.fullVideo}
                                    className="w-full h-full"
                                    autoPlay
                                    controls
                                    playsInline
                                />

                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-8 pointer-events-none">
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.originalName}</h2>
                                    <p className="text-gray-300">{selectedProject.description}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </StageExperience>
    );
};

export default Projects;
