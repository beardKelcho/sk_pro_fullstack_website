'use client';

import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import { useTranslations } from 'next-intl';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';

// STATIC CONTENT - No database dependency
const STATIC_HERO_CONTENT = {
    title: {
        tr: 'Profesyonel Görüntü Çözümleri',
        en: 'Professional Visual Solutions'
    },
    subtitle: {
        tr: 'Etkinliklerinizi Ölümsüzleştiriyoruz',
        en: 'Immortalizing Your Events'
    },
    description: {
        tr: 'SK Production olarak, her türlü etkinlik ve organizasyonunuz için profesyonel görüntü çözümleri sunuyoruz.',
        en: 'As SK Production, we provide professional visual solutions for all your events and organizations.'
    },
    buttonText: {
        tr: 'Projelerimiz',
        en: 'Our Projects'
    },
    buttonLink: '#projects',
    rotatingTexts: [
        { tr: 'Düğünler', en: 'Weddings' },
        { tr: 'Kurumsal Etkinlikler', en: 'Corporate Events' },
        { tr: 'Konserler', en: 'Concerts' },
        { tr: 'Spor Müsabakaları', en: 'Sports Events' }
    ],
    // Cloudinary video URL - replace with your actual working video URL
    backgroundVideo: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1/video/sample-hero-bg.mp4',
    backgroundImage: 'https://res.cloudinary.com/dmeviky6f/image/upload/v1/hero/hero-poster.jpg'
};

const Hero = () => {
    const tHome = useTranslations('site.home');
    const locale = tHome('locale') === 'tr' ? 'tr' : 'en'; // Get current locale

    const displayContent = {
        title: STATIC_HERO_CONTENT.title[locale],
        subtitle: STATIC_HERO_CONTENT.subtitle[locale],
        description: STATIC_HERO_CONTENT.description[locale],
        buttonText: STATIC_HERO_CONTENT.buttonText[locale],
        buttonLink: STATIC_HERO_CONTENT.buttonLink,
        rotatingTexts: STATIC_HERO_CONTENT.rotatingTexts.map(t => t[locale])
    };

    return (
        <>
            {/* Video Arkaplan */}
            {STATIC_HERO_CONTENT.backgroundVideo && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <VideoBackgroundPlayer
                        videoUrl={STATIC_HERO_CONTENT.backgroundVideo}
                        poster={STATIC_HERO_CONTENT.backgroundImage}
                        fallbackText={tHome('video.fallbackText')}
                    />
                </div>
            )}

            <ImmersiveHero
                content={displayContent as any}
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
