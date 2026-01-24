'use client';

import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import { useSiteContent, HeroContent } from '@/hooks/useSiteContent';
import { useTranslations } from 'next-intl';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';

const Hero = () => {
    const { useContent, resolveLocalized } = useSiteContent();
    const { data: heroData } = useContent('hero');
    const heroContent = heroData?.content as HeroContent | undefined;
    const tHome = useTranslations('site.home');

    // Default content if loading or empty (or use skeleton)
    const displayContent = {
        title: resolveLocalized(heroContent?.title),
        subtitle: resolveLocalized(heroContent?.subtitle),
        description: resolveLocalized(heroContent?.description),
        buttonText: resolveLocalized(heroContent?.buttonText) || 'Projelerimiz',
        buttonLink: heroContent?.buttonLink || '#projects',
        rotatingTexts: heroContent?.rotatingTexts?.map(t => resolveLocalized(t)) || [
            'Piksellerin Ötesinde, Kesintisiz Görüntü Yönetimi',
            'Medya Server ve Görüntü Rejisi Çözümleri',
            'Görsel Mükemmellikte Uzman Ekip'
        ],
        backgroundVideo: heroContent?.backgroundVideo,
        selectedVideo: heroContent?.selectedVideo,
        backgroundImage: heroContent?.backgroundImage,
        availableVideos: heroContent?.availableVideos
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
                content={displayContent as any} // Temporary cast as common component might expect strict type
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
