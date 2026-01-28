import React, { useState, useEffect } from 'react';
import { HeroContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import MediaPickerModal from '@/components/admin/media/MediaPickerModal';
import { Play, Image as ImageIcon, Video, X } from 'lucide-react';

interface HeroFormProps {
    content: HeroContent | undefined;
    onSave: (data: HeroContent) => void;
    saving: boolean;
}

import { FALLBACK_CONTENT } from '@/data/fallbackContent';

// ... imports

export default function HeroForm({ content, onSave, saving }: HeroFormProps) {
    // Helper to merge content with fallback
    const getInitialState = (currentContent: HeroContent | undefined) => {
        const fallback = FALLBACK_CONTENT.hero;
        return {
            title: {
                tr: currentContent?.title?.tr || fallback.title.tr,
                en: currentContent?.title?.en || fallback.title.en
            },
            subtitle: {
                tr: currentContent?.subtitle?.tr || fallback.subtitle.tr,
                en: currentContent?.subtitle?.en || fallback.subtitle.en
            },
            description: {
                tr: currentContent?.description?.tr || fallback.description.tr,
                en: currentContent?.description?.en || fallback.description.en
            },
            buttonText: {
                tr: currentContent?.buttonText?.tr || fallback.buttonText.tr,
                en: currentContent?.buttonText?.en || fallback.buttonText.en
            },
            buttonLink: currentContent?.buttonLink || fallback.buttonLink,
            backgroundVideo: currentContent?.backgroundVideo || '',
            selectedVideo: currentContent?.selectedVideo || '',
            availableVideos: currentContent?.availableVideos || [],
            backgroundImage: currentContent?.backgroundImage || '',
            rotatingTexts: (currentContent?.rotatingTexts && currentContent.rotatingTexts.length > 0)
                ? currentContent.rotatingTexts
                : fallback.rotatingTexts,
        };
    };

    const [formData, setFormData] = useState<HeroContent>(getInitialState(content));

    // Modals
    const [modalConfig, setModalConfig] = useState<{ open: boolean; type: 'image' | 'video' | null }>({ open: false, type: null });

    useEffect(() => {
        if (content) {
            setFormData(getInitialState(content));
        }
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleMediaSelect = (id: string, url: string) => {
        if (modalConfig.type === 'image') {
            // Fix: Store URL directly to avoid /api/site-images/... proxy 404s
            setFormData(prev => ({ ...prev, backgroundImage: url }));
        } else if (modalConfig.type === 'video') {
            console.log('HeroForm: Selected Video', { id, url });
            // Fix: Store URL directly
            setFormData(prev => ({ ...prev, selectedVideo: url, backgroundVideo: url }));
        }
        setModalConfig({ open: false, type: null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="p-2 bg-blue-100 rounded-lg text-blue-600"><Play size={20} /></span>
                    Hero / Giriş Bölümü
                </h2>
                <p className="text-sm text-gray-500 mt-1 pl-11">Anasayfanın en üstünde yer alan tam ekran tanıtım alanı.</p>
            </div>


            {/* Content Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                    <LocalizedInput
                        label="Ana Başlık (H1)"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        placeholder="Örn: Profesyonel Görüntü Çözümleri"
                    />
                    <LocalizedInput
                        label="Alt Başlık"
                        value={formData.subtitle}
                        onChange={(val) => setFormData({ ...formData, subtitle: val })}
                    />
                </div>
                <div className="space-y-4">
                    <LocalizedInput
                        label="Açıklama Metni"
                        value={formData.description}
                        onChange={(val) => setFormData({ ...formData, description: val })}
                        type="textarea"
                    />
                </div>
            </div>

            {/* Media Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Background Video */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arkaplan Video</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative min-h-[160px] flex flex-col items-center justify-center text-center">
                        {formData.selectedVideo ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-lg">
                                <Video size={40} className="text-blue-500 mb-2" />
                                <span className="text-xs text-gray-500 block w-full truncate px-4">{formData.selectedVideo}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, selectedVideo: '', backgroundVideo: '' })}
                                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="pointer-events-none">
                                <Video size={32} className="mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Video Seçilmedi</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setModalConfig({ open: true, type: 'video' })}
                            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors z-10"
                        >
                            {formData.selectedVideo ? 'Videoyu Değiştir' : 'Video Kütüphanesini Aç'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Önerilen: 1920x1080 MP4, Maks 50MB.</p>
                </div>

                {/* Background Image (Poster) */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poster / Yedek Görsel</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative min-h-[160px] flex flex-col items-center justify-center">
                        {formData.backgroundImage ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                <LazyImage src={getImageUrl(formData.backgroundImage)} alt="Bg" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                                    className="absolute top-2 right-2 p-1 bg-red-100/80 text-red-600 rounded-full hover:bg-red-200"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="pointer-events-none text-center">
                                <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Görsel Seçilmedi</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setModalConfig({ open: true, type: 'image' })}
                            className={`mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors z-10 ${formData.backgroundImage ? 'mt-2' : ''}`}
                        >
                            {formData.backgroundImage ? 'Görseli Değiştir' : 'Görsel Kütüphanesini Aç'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Videodan önce veya video yüklenemezse gösterilir.</p>
                </div>
            </div>

            {/* Buttons & Links */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Aksiyon Butonu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LocalizedInput
                        label="Buton Metni"
                        value={formData.buttonText}
                        onChange={(val) => setFormData({ ...formData, buttonText: val })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buton Linki</label>
                        <input
                            value={formData.buttonLink}
                            onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white"
                            placeholder="#contact"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end sticky bottom-4">
                <button type="submit" disabled={saving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all">
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            <MediaPickerModal
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                allowedTypes={modalConfig.type === 'video' ? 'video' : 'image'}
                onSelect={handleMediaSelect}
                title={modalConfig.type === 'video' ? 'Video Seç' : 'Görsel Seç'}
            />
        </form>
    );
}
