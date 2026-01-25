'use client';

import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import { useSiteContent, HeroContent } from '@/hooks/useSiteContent';
import { useTranslations } from 'next-intl';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';
import { getImageUrl } from '@/utils/imageUrl';

import { FALLBACK_CONTENT } from '@/data/fallbackContent';
// ... imports

const Hero = () => {
    const { useContent, resolveLocalized } = useSiteContent();
    const { data: heroData } = useContent('hero');
    // Force merge with fallback to ensure display
    const rawContent = heroData?.content as HeroContent | undefined;
    const fallback = FALLBACK_CONTENT.hero;

    // Create a safe content object that prioritized API data but falls back faithfully
    const heroContent: HeroContent = {
        title: {
            tr: rawContent?.title?.tr || fallback.title.tr,
            en: rawContent?.title?.en || fallback.title.en
        },
        subtitle: {
            tr: rawContent?.subtitle?.tr || fallback.subtitle.tr,
            en: rawContent?.subtitle?.en || fallback.subtitle.en
        },
        description: {
            tr: rawContent?.description?.tr || fallback.description.tr,
            en: rawContent?.description?.en || fallback.description.en
        },
        buttonText: {
            tr: rawContent?.buttonText?.tr || fallback.buttonText.tr,
            en: rawContent?.buttonText?.en || fallback.buttonText.en
        },
        buttonLink: rawContent?.buttonLink || fallback.buttonLink,
        backgroundVideo: rawContent?.backgroundVideo || '',
        selectedVideo: rawContent?.selectedVideo || '',
        availableVideos: rawContent?.availableVideos || [],
        backgroundImage: rawContent?.backgroundImage || '',
        rotatingTexts: (rawContent?.rotatingTexts && rawContent.rotatingTexts.length > 0)
            ? rawContent.rotatingTexts
            : fallback.rotatingTexts,
    };

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

    if (videoUrl) {
        fullVideoUrl = getImageUrl(videoUrl);
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
