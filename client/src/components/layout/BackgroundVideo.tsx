'use client';

import logger from '@/utils/logger';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';

const DEFAULT_VIDEO = '/hero-video.mp4';

const BackgroundVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Fetch hero content to get video URL
    const { data: heroData, isLoading } = useQuery({
        queryKey: ['hero-video'],
        queryFn: async () => {
            try {
                // Try fetching specifically hero section
                const res = await axios.get('/public/site-content/hero');
                return res.data;
            } catch (error) {
                logger.error('Failed to fetch hero video:', error);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1
    });

    // Determine video URL
    // API response structure might vary based on controller implementation
    // It could be res.data.data.videoUrl or res.data.videoUrl
    const apiVideoUrl = heroData?.data?.videoUrl || heroData?.videoUrl;

    // Use API video if available, otherwise fallback to default
    const videoSource = apiVideoUrl || DEFAULT_VIDEO;

    // Ensure video plays when source changes
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
