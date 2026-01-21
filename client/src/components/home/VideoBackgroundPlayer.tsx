'use client';

import React, { useRef, useState, useEffect } from 'react';
import logger from '@/utils/logger';

interface VideoBackgroundPlayerProps {
    videoUrl: string;
    poster?: string;
    fallbackText: string;
}

const VideoBackgroundPlayer: React.FC<VideoBackgroundPlayerProps> = ({
    videoUrl,
    poster,
    fallbackText,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (failed) return;
        const video = videoRef.current;
        if (!video) return;

        const handleError = (e: Event) => {
            setFailed(true);
            const videoEl = e.target as HTMLVideoElement;
            const error = videoEl.error;
            if (process.env.NODE_ENV === 'development') {
                logger.warn('Video yükleme hatası (fallback aktif):', {
                    videoUrl,
                    errorCode: error?.code,
                    errorMessage: error?.message
                });
            }
        };

        const handleLoadedData = () => {
            video.play().catch(() => {
                // Autoplay başarısız - sessizce devam et
            });
        };

        const handleCanPlayThrough = () => {
            video.play().catch(() => {
                // Autoplay başarısız - sessizce devam et
            });
        };

        video.addEventListener('error', handleError);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('canplaythrough', handleCanPlayThrough);

        return () => {
            video.removeEventListener('error', handleError);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('canplaythrough', handleCanPlayThrough);
        };
    }, [videoUrl, failed]);

    if (!videoUrl || failed) {
        return null;
    }

    return (
        <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={poster}
            key={videoUrl}
            style={{ zIndex: 0 }}
            crossOrigin="anonymous"
        >
            <source src={videoUrl} type="video/mp4" />
            {fallbackText}
        </video>
    );
};

export default VideoBackgroundPlayer;
