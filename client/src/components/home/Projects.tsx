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

// Types
interface VideoProject extends SiteImage {
    previewVideo?: string;
    fullVideo?: string;
}

// Sample placeholder videos
const PLACEHOLDER_VIDEOS = [
    'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-technological-interface-32763-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-lines-27666-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-supercomputers-20531-large.mp4',
    'https://assets.mixkit.co/videos/preview/mixkit-abstract-rendering-of-a-ball-of-energy-26131-large.mp4',
];

type TabType = 'videos' | 'photos';

const Projects = () => {
    const tHome = useTranslations('site.home');
    const [activeTab, setActiveTab] = useState<TabType>('videos');

    // Split States
    const [videoList, setVideoList] = useState<VideoProject[]>([]);
    const [photoList, setPhotoList] = useState<VideoProject[]>([]);

    // Lightbox States
    const [selectedVideo, setSelectedVideo] = useState<VideoProject | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<VideoProject | null>(null);

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

                    // Filtering Logic
                    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
                    const videos: VideoProject[] = [];
                    const photos: VideoProject[] = [];

                    activeImages.forEach((img: SiteImage) => {
                        const filename = (img.filename || '').toLowerCase();
                        const url = (img.url || '').toLowerCase();
                        const isVideo = videoExtensions.some(ext => filename.endsWith(ext) || url.endsWith(ext));

                        if (isVideo) {
                            videos.push({
                                ...img,
                                previewVideo: img.url,
                                fullVideo: img.url,
                            });
                        } else {
                            photos.push(img);
                        }
                    });

                    // Placeholder fallback if no videos found
                    if (videos.length === 0) {
                        const placeholders = activeImages.slice(0, 4).map((img: SiteImage, index: number) => ({
                            ...img,
                            previewVideo: PLACEHOLDER_VIDEOS[index % PLACEHOLDER_VIDEOS.length],
                            fullVideo: PLACEHOLDER_VIDEOS[index % PLACEHOLDER_VIDEOS.length],
                        }));
                        setVideoList(placeholders);
                    } else {
                        setVideoList(videos);
                    }

                    setPhotoList(photos);
                    imagesFetchedRef.current = true;
                }
            } catch (error) {
                logger.error('Proje yükleme hatası:', error);
            }
        };
        fetchImages();
    }, []);

    // Video Hover Logic (Target videoList)
    useEffect(() => {
        Object.entries(videoRefs.current).forEach(([id, video]) => {
            if (!video) return;
            if (id === hoveredProject) {
                video.currentTime = 0;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Auto-play might be blocked
                    })
                }
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, [hoveredProject]);

    // Keyboard Navigation for Photo Lightbox (Target photoList)
    const handlePhotoKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectedPhoto) return;
        const currentIndex = photoList.findIndex(p => (p._id || p.id) === (selectedPhoto._id || selectedPhoto.id));

        if (e.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % photoList.length;
            setSelectedPhoto(photoList[nextIndex]);
        } else if (e.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + photoList.length) % photoList.length;
            setSelectedPhoto(photoList[prevIndex]);
        } else if (e.key === 'Escape') {
            setSelectedPhoto(null);
        }
    }, [selectedPhoto, photoList]);

    useEffect(() => {
        if (selectedPhoto) {
            window.addEventListener('keydown', handlePhotoKeyDown);
            return () => window.removeEventListener('keydown', handlePhotoKeyDown);
        }
    }, [selectedPhoto, handlePhotoKeyDown]);

    return (
        <StageExperience>
            <section id="projects" className="relative py-24 bg-black overflow-hidden" style={{ scrollMarginTop: '100px' }}>

                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <StageSectionTitle
                        title={tHome('projectsSection.title')}
                        subtitle={tHome('projectsSection.subtitle')}
                    />

                    {/* Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 flex space-x-2">
                            {(['videos', 'photos'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-8 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#0066CC] rounded-full shadow-[0_0_20px_rgba(0,102,204,0.4)]"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2 capitalize">
                                        <Icon name={tab === 'videos' ? 'video' : 'screen'} className="w-4 h-4" />
                                        {tab === 'videos' ? 'Videolar' : 'Fotoğraflar'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'videos' ? (
                            <motion.div
                                key="videos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {videoList.length > 0 ? videoList.map((project, index) => (
                                    <div
                                        key={`vid-${project._id || index}`}
                                        className="group relative aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#0066CC]/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_40px_rgba(0,102,204,0.25)]"
                                        onMouseEnter={() => setHoveredProject(project._id || project.id || '')}
                                        onMouseLeave={() => setHoveredProject(null)}
                                        onClick={() => setSelectedVideo(project)}
                                    >
                                        {/* Cover */}
                                        <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${hoveredProject === (project._id || project.id) ? 'opacity-0' : 'opacity-100'}`}>
                                            {(() => {
                                                const url = getImageUrl({ image: project, imageId: project._id || project.id || '', fallback: '' });
                                                // Avoid rendering LazyImage if the url is a video file; video element below handles preview.
                                                // But usually video cards have a thumbnail.
                                                // For now, if it's a video file, we risk showing a broken image unless we have a thumbnail field.
                                                // Assuming typical use case: if it IS a video file, maybe don't show LazyImage? 
                                                // Or rely on object-cover. 
                                                // Let's keep it safe:
                                                const isVideo = ['.mp4', '.mov', '.webm'].some(ext => (url || '').toLowerCase().endsWith(ext));
                                                return (!isVideo && url) ? <LazyImage src={url} alt={project.originalName} className="object-cover w-full h-full" fill /> : null;
                                            })()}
                                        </div>

                                        {/* Preview Video */}
                                        <video
                                            ref={el => { if (project._id || project.id) videoRefs.current[project._id || project.id || ''] = el }}
                                            src={project.previewVideo}
                                            className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                                            muted loop playsInline
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 p-4 flex flex-col justify-end">
                                            <h3 className="text-white text-lg font-bold line-clamp-1">{project.originalName}</h3>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-400">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                            <Icon name="video" className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>Henüz video eklenmemiş.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="photos"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                            >
                                {photoList.length > 0 ? photoList.map((project, index) => (
                                    <div
                                        key={`pho-${project._id || index}`}
                                        className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in border border-white/5 hover:border-white/20 transition-all duration-300"
                                        onClick={() => setSelectedPhoto(project)}
                                    >
                                        <div className="relative w-full bg-gray-900">
                                            {(() => {
                                                const url = getImageUrl({ image: project, imageId: project._id || project.id || '', fallback: '' });
                                                return url ? (
                                                    <img
                                                        src={url}
                                                        alt={project.originalName}
                                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                ) : null;
                                            })()}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <Icon name="link" className="text-white w-8 h-8 opacity-80" />
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 text-center text-gray-400 w-full">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                            <Icon name="screen" className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p>Henüz fotoğraf eklenmemiş.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Video Lightbox */}
                <AnimatePresence>
                    {selectedVideo && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                            onClick={() => setSelectedVideo(null)}
                        >
                            <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors">
                                    <Icon name="close" className="w-6 h-6" />
                                </button>
                                <video src={selectedVideo.fullVideo} className="w-full h-full" autoPlay controls playsInline />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-8 pointer-events-none">
                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedVideo.originalName}</h2>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Photo Lightbox */}
                <AnimatePresence>
                    {selectedPhoto && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-xl flex items-center justify-center"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <button onClick={() => setSelectedPhoto(null)} className="absolute top-6 right-6 z-50 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
                                <Icon name="close" className="w-8 h-8" />
                            </button>

                            {/* Navigation */}
                            <button
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-[#0066CC] transition-colors z-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const idx = photoList.findIndex(p => (p._id || p.id) === (selectedPhoto._id || selectedPhoto.id));
                                    setSelectedPhoto(photoList[(idx - 1 + photoList.length) % photoList.length]);
                                }}
                            >
                                <Icon name="arrow-left" className="w-10 h-10" />
                            </button>
                            <button
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 text-white hover:text-[#0066CC] transition-colors z-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const idx = photoList.findIndex(p => (p._id || p.id) === (selectedPhoto._id || selectedPhoto.id));
                                    setSelectedPhoto(photoList[(idx + 1) % photoList.length]);
                                }}
                            >
                                <Icon name="arrow-right" className="w-10 h-10" />
                            </button>

                            <motion.div
                                key={selectedPhoto._id || selectedPhoto.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative max-w-[90vw] max-h-[90vh]"
                                onClick={e => e.stopPropagation()}
                            >
                                {(() => {
                                    const url = getImageUrl({ image: selectedPhoto, imageId: selectedPhoto._id || selectedPhoto.id || '', fallback: '' });
                                    return url ? <img src={url} alt={selectedPhoto.originalName} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" /> : null;
                                })()}
                                <div className="text-center mt-4">
                                    <h3 className="text-white text-xl font-medium">{selectedPhoto.originalName}</h3>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </StageExperience >
    );
};

export default Projects;
