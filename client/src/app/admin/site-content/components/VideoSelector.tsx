import React, { useState } from 'react';

interface VideoSelectorProps {
    selectedVideo?: string;
    availableVideos: { url: string; filename: string; uploadedAt?: string }[];
    onVideoSelect: (videoUrl: string, videoList?: any[]) => void;
}

export default function VideoSelector({ selectedVideo, availableVideos, onVideoSelect }: VideoSelectorProps) {
    // Simple dropdown or grid for now
    return (
        <div className="space-y-2">
            <select
                value={selectedVideo || ''}
                onChange={(e) => onVideoSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
                <option value="">Video Seçin</option>
                {availableVideos.map((v, i) => (
                    <option key={i} value={v.url}>
                        {v.filename}
                    </option>
                ))}
            </select>
            {/* Add logic to upload video here via onVideoSelect if needed later, 
          but for now relying on existing video list or manual URL as per old form behavior */}
        </div>
    );
}
