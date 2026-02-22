import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';

interface AboutSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Stat {
    label: string;
    value: string;
}

interface AboutForm {
    title: string;
    description: string;
    imageUrl: string;
    stats: Stat[];
}

const AboutSectionModal: React.FC<AboutSectionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Media picker state
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaTab, setMediaTab] = useState<'library' | 'upload'>('library');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<AboutForm>({
        title: '',
        description: '',
        imageUrl: '',
        stats: []
    });

    // Fetch current about data
    const { data: aboutData, isLoading } = useQuery({
        queryKey: ['admin-about'],
        queryFn: async () => {
            const res = await axios.get('/cms/about');
            return res.data;
        },
        enabled: isOpen,
    });

    // Fetch media library
    const { data: mediaData, isLoading: isMediaLoading, refetch: refetchMedia } = useQuery({
        queryKey: ['admin-media-images'],
        queryFn: async () => {
            const res = await axios.get('/media?type=image');
            return res.data;
        },
        enabled: mediaPickerOpen && mediaTab === 'library',
    });

    // Load data into form when available
    useEffect(() => {
        if (aboutData?.data) {
            setFormData({
                title: aboutData.data.title || '',
                description: aboutData.data.description || '',
                imageUrl: aboutData.data.imageUrl || '',
                stats: aboutData.data.stats || []
            });
        }
    }, [aboutData]);

    // Save mutation
    const saveAboutMutation = useMutation({
        mutationFn: async (data: AboutForm) => {
            const res = await axios.put('/cms/about', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-about'] });
            queryClient.invalidateQueries({ queryKey: ['about'] }); // Public query
            toast.success('Hakkımızda bölümü güncellendi');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Kaydetme hatası');
        },
    });

    // Media upload
    const handleMediaUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadFile);

        try {
            const res = await axios.post('/media/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Görsel yüklendi');
            setFormData(prev => ({ ...prev, imageUrl: res.data.data.url }));
            setUploadFile(null);
            setMediaPickerOpen(false);
            refetchMedia();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Yükleme hatası');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle stat operations
    const addStat = () => {
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, { label: '', value: '' }]
        }));
    };

    const removeStat = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    const updateStat = (index: number, field: 'label' | 'value', value: string) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.map((stat, i) =>
                i === index ? { ...stat, [field]: value } : stat
            )
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.imageUrl) {
            toast.error('Başlık, açıklama ve görsel zorunludur');
            return;
        }
        saveAboutMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Hakkımızda Yönetimi
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Başlık *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Örn: SK Production Hakkında"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Açıklama *
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Şirket hakkında detaylı açıklama..."
                                />
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Görsel *
                                </label>
                                {formData.imageUrl ? (
                                    <div className="relative group overflow-hidden rounded-lg">
                                        <div className="relative w-full h-64">
                                            <NextImage
                                                src={formData.imageUrl}
                                                alt="About"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 800px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setMediaPickerOpen(true)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                Değiştir
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                Kaldır
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setMediaPickerOpen(true)}
                                        className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                                    >
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm text-gray-500">Görsel Seç</span>
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        İstatistikler
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addStat}
                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ekle
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.stats.map((stat, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => updateStat(index, 'label', e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Etiket (örn: Yıllık Etkinlik)"
                                            />
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => updateStat(index, 'value', e.target.value)}
                                                className="w-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Değer (örn: 50+)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeStat(index)}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.stats.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            Henüz istatistik eklenmemiş. &quot;Ekle&quot; butonuna tıklayın.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveAboutMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {saveAboutMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Media Picker Modal */}
                {mediaPickerOpen && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-10">
                        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold">Görsel Seç</h3>
                                <button
                                    onClick={() => setMediaPickerOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
                                <button
                                    onClick={() => setMediaTab('library')}
                                    className={`px-4 py-2 font-medium ${mediaTab === 'library' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    Medya Kütüphanesi
                                </button>
                                <button
                                    onClick={() => setMediaTab('upload')}
                                    className={`px-4 py-2 font-medium ${mediaTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                >
                                    Yükle
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {mediaTab === 'library' ? (
                                    isMediaLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                        </div>
                                    ) : mediaData?.data?.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            Henüz görsel yüklenmemiş. &quot;Yükle&quot; sekmesinden ekleyin.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            {mediaData?.data?.map((item: any) => (
                                                <button
                                                    key={item._id}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, imageUrl: item.url }));
                                                        setMediaPickerOpen(false);
                                                    }}
                                                    className="relative group aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                                                >
                                                    <NextImage
                                                        src={item.url}
                                                        alt={item.name || 'Media'}
                                                        fill
                                                        sizes="(max-width: 768px) 33vw, 250px"
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">Seç</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <form onSubmit={handleMediaUpload} className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                                className="w-full"
                                            />
                                            {uploadFile && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Seçilen: {uploadFile.name}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!uploadFile || isUploading}
                                            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Yükleniyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    Yükle
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutSectionModal;
