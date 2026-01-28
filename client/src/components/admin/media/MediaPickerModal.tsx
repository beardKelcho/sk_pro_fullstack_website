'use client';

import React, { useState } from 'react';
import { useSiteImages, useUploadSiteImage, SiteImage } from '@/hooks/useSiteContent';
import AssetCard from './AssetCard';
import UploadZone from './UploadZone';
import { X, Image as ImageIcon, Video, UploadCloud, Grid } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (assetId: string, assetUrl: string) => void;
    allowedTypes?: 'image' | 'video' | 'all';
    title?: string;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    allowedTypes = 'all',
    title = 'Medya Seç'
}) => {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Determine category based on allowed types if stricter
    const queryCategory = allowedTypes === 'video' ? 'video' : undefined; // Backend filter if supported, else client filter

    const { data: imagesData, isLoading } = useSiteImages(queryCategory); // This might fetch all if category logic in hook isn't strict
    const uploadMutation = useUploadSiteImage();

    if (!isOpen) return null;

    const allAssets = imagesData?.images || [];

    // Client-side filtering for type safety visual
    const filteredAssets = allAssets.filter(asset => {
        if (allowedTypes === 'all') return true;
        const isVideo = asset.filename?.match(/\.(mp4|webm|mov)$/i) || asset.category === 'video';
        if (allowedTypes === 'video') return isVideo;
        if (allowedTypes === 'image') return !isVideo;
        return true;
    });

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        // Decide category based on allowedType or default to 'gallery'
        const category = allowedTypes === 'video' ? 'video' : 'gallery';

        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', category); // Important: backend uses 'image' field for both logic
            await uploadMutation.mutateAsync(formData);
        }
        // Switch to library after upload
        setActiveTab('library');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {allowedTypes === 'video' ? <Video size={20} /> : <ImageIcon size={20} />}
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activeTab === 'library' ? 'Kütüphaneden bir içerik seçin.' : 'Yeni içerik yükleyin.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all
                            ${activeTab === 'library'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                                : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Grid size={18} />
                        Medya Kütüphanesi
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all
                            ${activeTab === 'upload'
                                ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
                                : 'bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        <UploadCloud size={18} />
                        Yeni Yükle
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30">
                    {activeTab === 'library' ? (
                        isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredAssets.map(asset => (
                                    <div key={asset.id || asset._id} onClick={() => {
                                        const finalUrl = asset.url || getImageUrl(asset.id || asset._id);
                                        console.log('MediaPicker: Selecting', { id: asset.id || asset._id, url: finalUrl, rawAsset: asset });
                                        onSelect(asset.id || asset._id || '', finalUrl);
                                    }}>
                                        <AssetCard
                                            asset={asset}
                                            onToggleSelect={() => { }} // No multi-select in picker mode usually, or simple select
                                            onDelete={() => { }} // No delete in picker
                                            selectionMode={false}
                                            isSelected={false} // Could implement "selected" visual state
                                        />
                                    </div>
                                ))}
                                {filteredAssets.length === 0 && (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon size={48} className="mb-4 opacity-50" />
                                        <p>Henüz içerik yok veya filtreye uymuyor.</p>
                                        <button onClick={() => setActiveTab('upload')} className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">Hemen Yükle</button>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <div className="max-w-2xl mx-auto py-12">
                            <UploadZone onUpload={handleUpload} isUploading={uploadMutation.isPending} />
                            <p className="mt-4 text-center text-sm text-gray-500">
                                {allowedTypes === 'video'
                                    ? 'Sadece MP4, WebM formatları. Maks 100MB.'
                                    : 'JPG, PNG, WebP formatları.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MediaPickerModal;
