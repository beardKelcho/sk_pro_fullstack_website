import React, { useState, useEffect } from 'react';
import { AboutContent } from '@/hooks/useSiteContent';
import LocalizedInput from '@/components/common/LocalizedInput';
import { useSiteImages, SiteImage } from '@/hooks/useSiteContent';
import LazyImage from '@/components/common/LazyImage';
import { getImageUrl } from '@/utils/imageUrl';

interface AboutFormProps {
    content: AboutContent | undefined;
    onSave: (data: AboutContent) => void;
    saving: boolean;
}

export default function AboutForm({ content, onSave, saving }: AboutFormProps) {
    const [formData, setFormData] = useState<AboutContent>({
        title: { tr: '', en: '' },
        description: { tr: '', en: '' },
        stats: [],
        ...content
    });

    // Sync when content changes
    useEffect(() => {
        if (content) {
            setFormData(prev => ({ ...prev, ...content }));
        }
    }, [content]);

    // Image Modal Logic
    const { data: imagesData } = useSiteImages('about');
    const images: SiteImage[] = imagesData?.images || [];
    const [showImageModal, setShowImageModal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hakkımızda Bölümü</h2>

            <LocalizedInput
                label="Başlık"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
            />

            <LocalizedInput
                label="Açıklama"
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                type="textarea"
            />

            {/* Image Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Görsel</label>
                <div className="flex gap-4 items-start">
                    {formData.image && (
                        <div className="relative w-32 h-32 rounded-lg border overflow-hidden bg-gray-50">
                            <LazyImage src={getImageUrl(formData.image)} alt="About" fill className="object-cover" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    >
                        {formData.image ? 'Görseli Değiştir' : 'Görsel Seç'}
                    </button>
                    {formData.image && (
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm font-medium hover:bg-red-100"
                        >
                            Kaldır
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            {/* Quick Image Picker Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">Görsel Seç</h3>
                            <button onClick={() => setShowImageModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">Kapat</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((img: SiteImage) => (
                                <button
                                    type="button"
                                    key={img.id || img._id}
                                    onClick={() => { setFormData({ ...formData, image: img.id || img._id }); setShowImageModal(false); }}
                                    className="aspect-square relative cursor-pointer border-2 border-transparent hover:border-blue-500 focus:border-blue-500 rounded-lg overflow-hidden group w-full p-0"
                                    aria-label="Görsel seç"
                                >
                                    <LazyImage src={getImageUrl(img.id || img._id)} alt="img" fill className="object-cover transition-transform group-hover:scale-105 group-focus:scale-105" />
                                </button>
                            ))}
                            {images.length === 0 && <p className="col-span-full text-center py-8 text-gray-500">Bu kategoride görsel bulunamadı.</p>}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
