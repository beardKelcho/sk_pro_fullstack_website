'use client';

import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';

// STATIC TURKISH CONTENT
const HERO_CONTENT = {
    title: 'Profesyonel Görüntü Çözümleri',
    subtitle: 'Etkinliklerinizi Ölümsüzleştiriyoruz',
    description: 'SK Production olarak, her türlü etkinlik ve organizasyonunuz için profesyonel görüntü çözümleri sunuyoruz.',
    buttonText: 'Projelerimiz',
    buttonLink: '#projects',
    rotatingTexts: ['Düğünler', 'Kurumsal Etkinlikler', 'Konserler', 'Spor Müsabakaları'],
    backgroundVideo: 'https://res.cloudinary.com/dmeviky6f/video/upload/v1/video/sample-hero-bg.mp4',
    backgroundImage: 'https://res.cloudinary.com/dmeviky6f/image/upload/v1/hero/hero-poster.jpg'
};

const Hero = () => {
    return (
        <>
            {/* Video Arkaplan */}
            {HERO_CONTENT.backgroundVideo && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <VideoBackgroundPlayer
                        videoUrl={HERO_CONTENT.backgroundVideo}
                        poster={HERO_CONTENT.backgroundImage}
                        fallbackText="Video yüklenemedi. Tarayıcınız video formatını desteklemiyor."
                    />
                </div>
            )}

            <ImmersiveHero
                content={HERO_CONTENT as any}
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
