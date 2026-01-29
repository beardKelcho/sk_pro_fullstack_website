import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2 } from 'lucide-react';

interface HeroSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

const HeroSectionModal: React.FC<HeroSectionModalProps> = ({ isOpen, onClose, initialData }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        videoUrl: '', // Cloudinary ID or URL
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                videoUrl: initialData.videoUrl || '',
            });
        }
    }, [initialData]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axios.post('/admin/site-content', {
                section: 'hero',
                content: data
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
            toast.success('Hero bölümü güncellendi');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Güncelleme hatası');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hero Bölümü Düzenle</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Başlık
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Örn: Piksellerin Ötesinde"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Alt Başlık
                        </label>
                        <textarea
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Kısa açıklama..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Video Konumu (Cloudinary ID veya URL)
                        </label>
                        <input
                            type="text"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Örn: v1/hero/showreel.mp4"
                        />
                        <p className="text-xs text-gray-500 mt-1">Video dosyasını Cloudinary&apos;ye yükleyip buraya ID veya tam URL girebilirsiniz.</p>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSectionModal;
