import React, { useState, useEffect } from 'react';
import { HeroContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';
import { getImageUrl } from '@/utils/imageUrl';
import LazyImage from '@/components/common/LazyImage';
import MediaPickerModal from '@/components/admin/media/MediaPickerModal';
import { Play, Image as ImageIcon, Video, X, Layout, Type } from 'lucide-react';

interface HeroFormProps {
    content: HeroContent | undefined;
    onSave: (data: HeroContent) => void;
    saving: boolean;
}

import { FALLBACK_CONTENT } from '@/data/fallbackContent';

export default function HeroForm({ content, onSave, saving }: HeroFormProps) {
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
    const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');
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
            setFormData(prev => ({ ...prev, backgroundImage: url }));
        } else if (modalConfig.type === 'video') {
            console.log('HeroForm: Setting Video', url);
            // Ensure both selectedVideo and backgroundVideo are updated for consistency
            setFormData(prev => ({
                ...prev,
                selectedVideo: url,
                backgroundVideo: url
            }));
        }
        setModalConfig({ open: false, type: null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
            {/* Header with Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="p-2 bg-blue-100 rounded-lg text-blue-600"><Play size={20} /></span>
                        Hero / Giriş Bölümü Yönetimi
                    </h2>
                </div>

                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('content')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative
                            ${activeTab === 'content'
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                        <Type size={18} />
                        Metin & İçerik
                        {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('media')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative
                            ${activeTab === 'media'
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                        <Layout size={18} />
                        Arkaplan & Medya
                        {activeTab === 'media' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                    </button>
                </div>

                <div className="p-6">
                    {/* Tab 1: Text Content */}
                    {activeTab === 'content' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                            <div className="space-y-5">
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
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="#contact"
                                    />
                                </div>
                            </div>
                            <div className="space-y-5">
                                <LocalizedInput
                                    label="Açıklama Metni"
                                    value={formData.description}
                                    onChange={(val) => setFormData({ ...formData, description: val })}
                                    type="textarea"
                                    className="h-full min-h-[200px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Media */}
                    {activeTab === 'media' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                            {/* Background Video */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arkaplan Video</label>
                                    {formData.selectedVideo && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Aktif</span>
                                    )}
                                </div>

                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50 dark:bg-gray-900/50 min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
                                    {formData.selectedVideo ? (
                                        <div className="relative w-full h-full min-h-[240px] flex items-center justify-center bg-black rounded-lg overflow-hidden">
                                            <video
                                                src={getImageUrl(formData.selectedVideo)}
                                                className="w-full h-full object-cover opacity-80"
                                                muted
                                                loop
                                                autoPlay
                                                playsInline
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                                <p className="text-white text-xs truncate opacity-80">{formData.selectedVideo}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, selectedVideo: '', backgroundVideo: '' })}
                                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                                    title="Videoyu Kaldır"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Video size={28} />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Video Seçilmedi</h4>
                                            <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">MP4 veya WebM formatında, tercihen 1080p video yükleyin.</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalConfig({ open: true, type: 'video' })}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Video size={16} />
                                    {formData.selectedVideo ? 'Videoyu Değiştir' : 'Video Kütüphanesini Aç'}
                                </button>
                            </div>

                            {/* Poster Image */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poster / Yedek Görsel</label>
                                    {formData.backgroundImage && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Aktif</span>
                                    )}
                                </div>

                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50 dark:bg-gray-900/50 min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-300 transition-colors">
                                    {formData.backgroundImage ? (
                                        <div className="relative w-full h-full min-h-[240px] rounded-lg overflow-hidden">
                                            <LazyImage
                                                src={getImageUrl(formData.backgroundImage)}
                                                alt="Poster"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, backgroundImage: '' })}
                                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                                    title="Görseli Kaldır"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ImageIcon size={28} />
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Poster Seçilmedi</h4>
                                            <p className="text-xs text-gray-500 mt-1">Video yüklenene kadar veya mobil cihazlarda gösterilir.</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalConfig({ open: true, type: 'image' })}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ImageIcon size={16} />
                                    {formData.backgroundImage ? 'Görseli Değiştir' : 'Görsel Kütüphanesini Aç'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Action */}
            <div className="flex justify-end sticky bottom-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all transform active:scale-95"
                >
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
