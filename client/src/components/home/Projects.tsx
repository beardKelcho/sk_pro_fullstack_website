'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Carousel, { CarouselRef } from '@/components/common/Carousel';
import InteractiveProjectCard from '@/components/common/InteractiveProjectCard';
import StageExperience, { StageSectionTitle } from '@/components/common/StageExperience';
import LazyImage from '@/components/common/LazyImage';
import Icon from '@/components/common/Icon';
import { SiteImage } from '@/services/siteImageService';
import { getImageUrl } from '@/utils/imageUrl';
import { useTranslations } from 'next-intl';
import logger from '@/utils/logger';

const Projects = () => {
    const tHome = useTranslations('site.home');
    const [topImages, setTopImages] = useState<SiteImage[]>([]);
    const [bottomImages, setBottomImages] = useState<SiteImage[]>([]);
    const [allProjectImages, setAllProjectImages] = useState<SiteImage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);
    const [isTopCarousel, setIsTopCarousel] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    const topCarouselRef = useRef<CarouselRef | null>(null);
    const bottomCarouselRef = useRef<CarouselRef | null>(null);
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
                    setAllProjectImages(activeImages);
                    if (activeImages.length > 0) {
                        const sortedImages = [...activeImages].sort((a, b) => a.order - b.order);
                        const offset = Math.ceil(sortedImages.length / 2);
                        setTopImages([...sortedImages]);
                        setBottomImages(sortedImages.length > 1 ? [...sortedImages.slice(offset), ...sortedImages.slice(0, offset)] : []);
                    }
                    imagesFetchedRef.current = true;
                }
            } catch (error) {
                logger.error('Resim yükleme hatası:', error);
            }
        };
        fetchImages();
    }, []);

    const handleImageClick = (image: SiteImage, isTop: boolean) => {
        if (isTop && topCarouselRef.current) topCarouselRef.current.saveScrollPosition();
        else if (!isTop && bottomCarouselRef.current) bottomCarouselRef.current.saveScrollPosition();
        setSelectedImage(image);
        setIsTopCarousel(isTop);
        setIsModalOpen(true);
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedImage(null);
        setTimeout(() => {
            if (isTopCarousel && topCarouselRef.current) topCarouselRef.current.restoreScrollPosition();
            else if (!isTopCarousel && bottomCarouselRef.current) bottomCarouselRef.current.restoreScrollPosition();
        }, 100);
    }, [isTopCarousel]);

    const handleModalBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isModalOpen || !selectedImage) return;
        const currentImages = isTopCarousel ? topImages : bottomImages;
        const currentIndex = currentImages.findIndex(img => (img._id || img.id) === (selectedImage._id || selectedImage.id));
        if (e.key === 'ArrowRight') {
            const nextIndex = (currentIndex + 1) % currentImages.length;
            setSelectedImage(currentImages[nextIndex]);
        } else if (e.key === 'ArrowLeft') {
            const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            setSelectedImage(currentImages[prevIndex]);
        } else if (e.key === 'Escape') closeModal();
    }, [isModalOpen, selectedImage, isTopCarousel, topImages, bottomImages, closeModal]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const isCarouselPaused = isModalOpen;

    return (
        <StageExperience>
            <section id="projects" className="relative py-32 bg-gradient-to-b from-black/90 via-black/80 to-black/90 overflow-hidden" style={{ position: 'relative', scrollMarginTop: '100px', marginTop: '6rem', marginBottom: '6rem' }}>
                <div className="container mx-auto px-6">
                    <StageSectionTitle
                        title={tHome('projectsSection.title')}
                        subtitle={tHome('projectsSection.subtitle')}
                    />
                    {topImages.length > 0 && (
                        <div className="mb-8" key={`top-carousel-${topImages.length}`}>
                            <Carousel images={topImages} direction="right" isPaused={isCarouselPaused} onImageClick={(image) => handleImageClick(image, true)} isTop={true} ref={topCarouselRef} />
                        </div>
                    )}
                    {bottomImages.length > 0 && (
                        <div className="mt-8" key={`bottom-carousel-${bottomImages.length}`}>
                            <Carousel images={bottomImages} direction="left" isPaused={isCarouselPaused} onImageClick={(image) => handleImageClick(image, false)} isTop={false} ref={bottomCarouselRef} />
                        </div>
                    )}
                    {topImages.length === 0 && bottomImages.length === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                            <AnimatePresence>
                                {topImages.slice(0, 8).map((image, index) => (
                                    <InteractiveProjectCard
                                        key={image._id || image.id || index}
                                        image={image}
                                        index={index}
                                        onClick={() => handleImageClick(image, true)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
                            onClick={handleModalBackdropClick}
                        >
                            <motion.div
                                ref={modalRef}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="relative w-[90vw] max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <button onClick={closeModal} className="absolute top-6 right-6 z-10 text-white bg-black/50 rounded-full p-3 hover:bg-[#0066CC] transition-all">
                                    <Icon name="close" className="h-7 w-7" />
                                </button>
                                {/* Arrows */}
                                <button
                                    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-[#0066CC] transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentImages = isTopCarousel ? topImages : bottomImages;
                                        const currentIndex = currentImages.findIndex(img => (img._id || img.id) === (selectedImage._id || selectedImage.id));
                                        const prevIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
                                        setSelectedImage(currentImages[prevIndex]);
                                    }}
                                >
                                    <Icon name="arrow-left" className="h-8 w-8" />
                                </button>
                                <button
                                    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 text-white bg-black/50 rounded-full p-4 hover:bg-[#0066CC] transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentImages = isTopCarousel ? topImages : bottomImages;
                                        const currentIndex = currentImages.findIndex(img => (img._id || img.id) === (selectedImage._id || selectedImage.id));
                                        const nextIndex = (currentIndex + 1) % currentImages.length;
                                        setSelectedImage(currentImages[nextIndex]);
                                    }}
                                >
                                    <Icon name="arrow-right" className="h-8 w-8" />
                                </button>

                                <div className="p-6 w-full h-full flex items-center justify-center" style={{ minHeight: '400px', height: '85vh' }}>
                                    {(() => {
                                        const imageId = selectedImage._id || selectedImage.id;
                                        const imageUrl = getImageUrl({
                                            image: selectedImage,
                                            imageId: imageId as string,
                                            fallback: selectedImage.url || selectedImage.path || ''
                                        });

                                        if (!imageUrl || imageUrl.trim() === '') {
                                            return <div className="text-white text-center"><p>Resim yüklenemedi</p></div>;
                                        }

                                        return (
                                            <div className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center">
                                                <LazyImage
                                                    src={imageUrl}
                                                    alt={selectedImage.originalName || selectedImage.filename || 'Proje'}
                                                    className="rounded-lg shadow-2xl"
                                                    fill={true}
                                                    priority={true}
                                                    objectFit="contain"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vh"
                                                    quality={90}
                                                />
                                            </div>
                                        );
                                    })()}
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
