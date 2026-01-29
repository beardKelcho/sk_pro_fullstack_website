import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';
import { HeroContent } from '@/types/cms';

interface HeroProps {
    content?: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
    // If no content provided (empty state), return null or loading
    if (!content) {
        return null; // Or a skeleton/placeholder if preferred
    }

    return (
        <>
            {/* Video Arkaplan */}
            {content.backgroundVideo && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <VideoBackgroundPlayer
                        videoUrl={content.backgroundVideo}
                        poster={content.backgroundImage}
                        fallbackText="Video yüklenemedi. Tarayıcınız video formatını desteklemiyor."
                    />
                </div>
            )}

            <ImmersiveHero
                content={content as any}
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
