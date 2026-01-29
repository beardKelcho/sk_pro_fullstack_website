import React from 'react';
import ImmersiveHero from '@/components/common/ImmersiveHero';
import VideoBackgroundPlayer from './VideoBackgroundPlayer';
import { HeroContent } from '@/types/cms';

interface HeroProps {
    content?: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
    // Debug için log
    console.log('Hero Data:', content);

    // If no content provided (empty state), return null or loading
    if (!content) {
        return null;
    }

    // Video URL mapping (Backend videoUrl gönderiyor, frontend backgroundVideo bekliyor olabilir)
    const activeVideoUrl = content.videoUrl || content.backgroundVideo;

    return (
        <>
            {/* Video Arkaplan */}
            {activeVideoUrl && (
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                    <VideoBackgroundPlayer
                        videoUrl={activeVideoUrl}
                        poster={content.backgroundImage}
                        fallbackText="Video yüklenemedi. Tarayıcınız video formatını desteklemiyor."
                    />
                </div>
            )}

            <ImmersiveHero
                content={{
                    ...content,
                    rotatingTexts: content.rotatingTexts || [], // Ensure array
                } as any}
                onScrollDown={() => {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
            />
        </>
    );
};

export default Hero;
