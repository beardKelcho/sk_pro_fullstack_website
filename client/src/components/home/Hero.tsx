'use client';

import React, { useState, useEffect } from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import { HeroContent as HeroContentType } from '@/services/siteContentService';
import { useTranslations } from 'next-intl';
import logger from '@/utils/logger';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';

const Hero = () => {
    const [heroContent, setHeroContent] = useState<HeroContentType | null>(null);
    const tHome = useTranslations('site.home');

    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await fetch('/api/site-content/public/hero', {
                    headers: { 'Cache-Control': 'no-cache' },
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.content?.content) {
                        setHeroContent(data.content.content);
                    }
                }
            } catch (error) {
                logger.error('Hero content fetch error:', error);
            }
        };

        fetchHeroContent();
    }, []);

    // Override content with requested title
    const displayContent: HeroContentType = {
        ...(heroContent || {
            subtitle: '',
            description: '',
            buttonText: 'Projelerimiz',
            buttonLink: '#projects',
        } as any),
        rotatingTexts: [
            'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi',
            'Medya Server ve Görüntü Rejisi Çözümleri',
            'Görsel Mükemmellikte Uzman Ekip'
        ],
    };

    const videoUrl = heroContent?.selectedVideo || heroContent?.backgroundVideo || '';
    let fullVideoUrl = videoUrl;

    if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        if (/^[0-9a-fA-F]{24}$/.test(videoUrl)) {
            fullVideoUrl = `/api/site-images/public/${videoUrl}/image`;
        } else if (videoUrl.startsWith('/uploads/')) {
            fullVideoUrl = videoUrl;
        } else if (videoUrl.startsWith('/')) {
            fullVideoUrl = videoUrl;
        } else if (videoUrl.includes('/')) {
            fullVideoUrl = `/uploads/${videoUrl}`;
        } else {
            fullVideoUrl = `/uploads/general/${videoUrl}`;
        }
    }

    return (
        <>
            {/* Video Arkaplan */}
            {fullVideoUrl && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <VideoBackgroundPlayer
                        videoUrl={fullVideoUrl}
                        poster={heroContent?.backgroundImage}
                        fallbackText={tHome('video.fallbackText')}
                    />
                </div>
            )}

            <ImmersiveHero
                content={displayContent}
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
