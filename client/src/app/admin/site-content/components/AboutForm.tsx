import React, { useState, useEffect } from 'react';
import { AboutContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';
import LazyImage from '@/components/common/LazyImage';
import { getImageUrl } from '@/utils/imageUrl';
import MediaPickerModal from '@/components/admin/media/MediaPickerModal';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { FALLBACK_CONTENT } from '@/data/fallbackContent';

interface AboutFormProps {
    content: AboutContent | undefined;
    onSave: (data: AboutContent) => void;
    saving: boolean;
}

export default function AboutForm({ content, onSave, saving }: AboutFormProps) {
    const getInitialState = (currentContent: AboutContent | undefined) => {
        const fallback = FALLBACK_CONTENT.about;
        return {
            title: {
                tr: currentContent?.title?.tr || fallback.title.tr,
                en: currentContent?.title?.en || fallback.title.en
            },
            description: {
                tr: currentContent?.description?.tr || fallback.description.tr,
                en: currentContent?.description?.en || fallback.description.en
            },
            stats: (currentContent?.stats && currentContent.stats.length > 0)
                ? currentContent.stats
                : fallback.stats,
            image: currentContent?.image || '',
        };
    };

    const [formData, setFormData] = useState<AboutContent>(getInitialState(content));

    // Modal Configuration
    const [modalConfig, setModalConfig] = useState<{ open: boolean; type: 'image' | null }>({ open: false, type: null });

    // Sync when content changes
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
            setFormData(prev => ({ ...prev, image: url }));
        }
        setModalConfig({ open: false, type: null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hakkımızda Bölümü</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <LocalizedInput
                        label="Ana Başlık (H2)"
                        value={formData.title}
                        onChange={(val) => setFormData({ ...formData, title: val })}
                        placeholder="Örn: Hakkımızda"
                    />
                    <LocalizedInput
                        label="Açıklama Metni"
                        value={formData.description}
                        onChange={(val) => setFormData({ ...formData, description: val })}
                        type="textarea"
                    />
                </div>
            </div>

            {/* Media Section */}
            <div className="grid grid-cols-1 gap-8">
                {/* About Image */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Görsel (Varsayılan)</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative min-h-[160px] flex flex-col items-center justify-center text-center">
                        {formData.image ? (
                            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                                <LazyImage src={getImageUrl(formData.image)} alt="About" fill className="object-cover" />
                                <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-2 right-2 p-1 bg-red-100/90 text-red-600 rounded-full hover:bg-red-200">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="pointer-events-none mb-2">
                                <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Görsel Seçilmedi</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setModalConfig({ open: true, type: 'image' })}
                            className={`mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 z-10`}
                        >
                            {formData.image ? 'Görseli Değiştir' : 'Görsel Kütüphanesini Aç'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            <MediaPickerModal
                isOpen={modalConfig.open}
                onClose={() => setModalConfig({ ...modalConfig, open: false })}
                allowedTypes={'image'}
                onSelect={handleMediaSelect}
                title={'Görsel Seç'}
            />
        </form>
    );
}
