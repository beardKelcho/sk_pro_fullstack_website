'use client';



import React, { useEffect, useRef } from 'react';

const DEFAULT_VIDEO = '/hero-video.mp4';

interface BackgroundVideoProps {
    videoUrl?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ videoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const videoSource = videoUrl || DEFAULT_VIDEO;

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [videoSource]);

    return (
        <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
            >
                <source src={videoSource} type="video/mp4" />
                {/* Support for other formats if needed */}
            </video>

            {/* Global Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
    );
};

export default BackgroundVideo;
