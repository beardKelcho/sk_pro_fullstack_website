import React, { useState, useEffect } from 'react';
import { HeroContent, SiteImage, useSiteImages } from '@/hooks/useSiteContent';
import VideoSelector from './VideoSelector';
import LazyImage from '@/components/common/LazyImage';
import LocalizedInput from '@/components/common/LocalizedInput';
import { getImageUrl } from '@/utils/imageUrl';

interface HeroFormProps {
    content: HeroContent | undefined;
    onSave: (data: HeroContent) => void;
    saving: boolean;
}

export default function HeroForm({ content, onSave, saving }: HeroFormProps) {
    // Initialize with defaults
    const [formData, setFormData] = useState<HeroContent>({
        title: { tr: '', en: '' },
        subtitle: { tr: '', en: '' },
        description: { tr: '', en: '' },
        buttonText: { tr: 'İletişime Geçin', en: 'Contact Us' },
        buttonLink: '#contact',
        backgroundVideo: '',
        selectedVideo: '',
        availableVideos: [],
        backgroundImage: '',
        rotatingTexts: [],
        ...content
    });

    // Load images for modal
    const { data: imagesData } = useSiteImages('hero');
    const images: SiteImage[] = imagesData?.images || [];

    const [showImageModal, setShowImageModal] = useState(false);

    // Sync content props to state if they change (e.g. data load after render)
    useEffect(() => {
        if (content) {
            setFormData((prev: HeroContent) => ({ ...prev, ...content }));
        }
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hero Bölümü</h2>

            {/* Title */}
            <LocalizedInput
                label="Başlık"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
            />

            {/* Subtitle */}
            <LocalizedInput
                label="Alt Başlık"
                value={formData.subtitle}
                onChange={(val) => setFormData({ ...formData, subtitle: val })}
            />

            {/* Description */}
            <LocalizedInput
                label="Açıklama"
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                type="textarea"
            />

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <LocalizedInput
                        label="Buton Metni"
                        value={formData.buttonText}
                        onChange={(val) => setFormData({ ...formData, buttonText: val })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buton Linki</label>
                    <input value={formData.buttonLink} onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })} className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-600 dark:text-white" />
                </div>
            </div>

            {/* Video */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arkaplan Video</label>
                <VideoSelector
                    selectedVideo={formData.selectedVideo || formData.backgroundVideo}
                    availableVideos={formData.availableVideos || []}
                    onVideoSelect={(url) => setFormData({ ...formData, selectedVideo: url, backgroundVideo: url })}
                />
                <input
                    type="text"
                    placeholder="Manuel Video URL"
                    value={formData.selectedVideo || ''}
                    onChange={(e) => setFormData({ ...formData, selectedVideo: e.target.value, backgroundVideo: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
            </div>

            {/* Background Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arkaplan Görsel</label>
                <div className="flex gap-3 items-start">
                    {formData.backgroundImage && (
                        <div className="relative w-32 h-20 rounded border overflow-hidden">
                            <LazyImage src={getImageUrl(formData.backgroundImage)} alt="Bg" fill className="object-cover" />
                        </div>
                    )}
                    <button type="button" onClick={() => setShowImageModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                        {formData.backgroundImage ? 'Değiştir' : 'Görsel Seç'}
                    </button>
                </div>
            </div>

            <button type="submit" disabled={saving} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img: SiteImage) => (
                                <div key={img._id || img.id} onClick={() => { setFormData({ ...formData, backgroundImage: img._id || img.id }); setShowImageModal(false); }} className="aspect-square relative cursor-pointer border border-gray-200">
                                    <LazyImage src={getImageUrl(img._id || img.id)} alt="img" fill className="object-cover" />
                                </div>
                            ))}
                            {images.length === 0 && <p className="col-span-4 text-center">Görsel bulunamadı.</p>}
                        </div>
                        <button onClick={() => setShowImageModal(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Kapat</button>
                    </div>
                </div>
            )}
        </form>
    );
}
