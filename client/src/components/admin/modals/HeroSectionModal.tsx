import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2, Upload, Grid, Video } from 'lucide-react';

interface HeroSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

const HeroSectionModal: React.FC<HeroSectionModalProps> = ({ isOpen, onClose, initialData }) => {
    const queryClient = useQueryClient();

    // Form and standard state
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

    // --- Media Picker Logic ---
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerTab, setPickerTab] = useState<'library' | 'upload'>('library');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch Media
    const { data: mediaData, isLoading: isMediaLoading, refetch: refetchMedia } = useQuery({
        queryKey: ['admin-media', 'video'],
        queryFn: async () => {
            const res = await axios.get('/media?type=video');
            return res.data;
        },
        enabled: isPickerOpen && pickerTab === 'library'
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadFile);

        try {
            const res = await axios.post('/media/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Video yüklendi');
            setFormData(prev => ({ ...prev, videoUrl: res.data.data.url }));
            setIsPickerOpen(false);
            setUploadFile(null);
            refetchMedia();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Yükleme hatası');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelectMedia = (url: string) => {
        setFormData(prev => ({ ...prev, videoUrl: url }));
        setIsPickerOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {isPickerOpen ? 'Video Seç / Yükle' : 'Hero Bölümü Düzenle'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isPickerOpen ? (
                    /* Media Picker Interface */
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setPickerTab('library')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${pickerTab === 'library' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Grid className="w-4 h-4" />
                                Kütüphane (Videolar)
                            </button>
                            <button
                                onClick={() => setPickerTab('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${pickerTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            >
                                <Upload className="w-4 h-4" />
                                Yeni Yükle
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/30">
                            {pickerTab === 'library' ? (
                                isMediaLoading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    </div>
                                ) : mediaData?.data?.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {mediaData.data.map((item: any) => (
                                            <div key={item._id}
                                                onClick={() => handleSelectMedia(item.url)}
                                                className="group relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all">
                                                <video src={item.url} className="w-full h-full object-cover" muted />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-xs text-white truncate">{item.name}</p>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                                                        <Save className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p>Kütüphanede hiç video yok.</p>
                                        <button onClick={() => setPickerTab('upload')} className="text-blue-500 hover:underline mt-2">Yeni yüklemek için tıklayın</button>
                                    </div>
                                )
                            ) : (
                                /* Upload Tab */
                                <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto">
                                    <div className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                                                <Loader2 className={`w-8 h-8 ${isUploading ? 'animate-spin' : ''}`} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {isUploading ? 'Yükleniyor...' : (uploadFile ? uploadFile.name : 'Video Seçmek İçin Tıklayın')}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">MP4, WEBM, MOV (Max 100MB)</p>
                                            </div>
                                        </label>
                                    </div>
                                    {uploadFile && !isUploading && (
                                        <button
                                            onClick={handleUpload}
                                            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                                        >
                                            Yüklemeyi Başlat
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between">
                            <button
                                onClick={() => setIsPickerOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Vazgeç
                            </button>
                            <div className="text-xs text-gray-400 self-center">
                                {mediaData?.data?.length || 0} Video Mevcut
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Main Form */
                    <>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
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
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Örn: v1/hero/showreel.mp4"
                                        />
                                        <Video className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsPickerOpen(true)}
                                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <Grid className="w-4 h-4" />
                                        Kütüphane / Yükle
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Video dosyasını kütüphaneden seçebilir veya yeni video yükleyebilirsiniz.</p>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl shrink-0">
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
                    </>
                )}
            </div>
        </div>
    );
};

export default HeroSectionModal;
