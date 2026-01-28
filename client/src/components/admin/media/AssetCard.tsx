import React from 'react';
import LazyImage from '@/components/common/LazyImage';
import { getImageUrl } from '@/utils/imageUrl';
import { Trash2, ExternalLink, Check } from 'lucide-react';

interface AssetCardProps {
    asset: any;
    isSelected?: boolean;
    onToggleSelect: (id: string) => void;
    onDelete: (id: string) => void;
    selectionMode?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({
    asset,
    isSelected = false,
    onToggleSelect,
    onDelete,
    selectionMode = false
}) => {
    const imageUrl = getImageUrl(asset.id || asset._id);
    const isVideo = asset.filename?.toLowerCase().match(/\.(mp4|webm|mov|avi)$/) || asset.category === 'video';

    return (
        <div
            className={`group relative aspect-square border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 
        ${isSelected
                    ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                } bg-white dark:bg-gray-800 shadow-sm hover:shadow-md`}
            onClick={() => onToggleSelect(asset.id || asset._id)}
        >
            {/* Thumbnail */}
            {isVideo ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 pointer-events-none">
                    <video src={imageUrl} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <span className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">VIDEO</span>
                    </div>
                </div>
            ) : (
                <LazyImage
                    src={imageUrl}
                    alt={asset.filename || 'asset'}
                    fill
                    className="object-cover w-full h-full"
                />
            )}

            {/* Overlay controls - Always visible if selected, else on hover */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 flex flex-col justify-between p-3 
        ${isSelected || selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>

                <div className="flex justify-between items-start">
                    {/* Checkbox */}
                    <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/20 border-white hover:bg-white/40'}
            `}
                    >
                        {isSelected && <Check size={14} className="text-white" />}
                    </div>
                </div>

                <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => window.open(imageUrl, '_blank')}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white text-gray-700 transition"
                        title="Görüntüle"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(asset.id || asset._id)}
                        className="p-2 bg-red-100/90 rounded-lg hover:bg-red-200 text-red-600 transition"
                        title="Sil"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetCard;
