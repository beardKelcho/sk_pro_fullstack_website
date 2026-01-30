import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2, Upload, Grid, Video, Trash2, Plus, Edit2, Image, Film, Images } from 'lucide-react';

interface ProjectsSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProjectForm {
    _id?: string;
    type: 'photo' | 'video';
    title: string;
    category: string;
    description: string;
    coverUrl: string;
    imageUrls: string[];
    videoUrl: string;
    order: number;
    isActive: boolean;
}

const CATEGORIES = ['Konser', 'Festival', 'Lansman', 'Kongre', 'Sahne Kurulumu'];

const ProjectsSectionModal: React.FC<ProjectsSectionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Main tabs
    const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
    const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);

    // Media picker state
    const [mediaPickerFor, setMediaPickerFor] = useState<'cover' | 'video' | 'images' | null>(null);
    const [mediaTab, setMediaTab] = useState<'library' | 'upload'>('library');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState<ProjectForm>({
        type: 'photo',
        title: '',
        category: 'Konser',
        description: '',
        coverUrl: '',
        imageUrls: [],
        videoUrl: '',
        order: 0,
        isActive: true,
    });

    // Fetch projects
    const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
        queryKey: ['showcase-projects-admin'],
        queryFn: async () => {
            const res = await axios.get('/showcase-projects');
            return res.data;
        },
        enabled: isOpen,
    });

    // Fetch media (images + videos)
    const { data: mediaData, isLoading: isMediaLoading, refetch: refetchMedia } = useQuery({
        queryKey: ['admin-media', mediaPickerFor],
        queryFn: async () => {
            const type = (mediaPickerFor === 'cover' || mediaPickerFor === 'images') ? 'image' : 'video';
            const res = await axios.get(`/media?type=${type}`);
            return res.data;
        },
        enabled: mediaPickerFor !== null && mediaTab === 'library',
    });

    // Create/Update project mutation
    const saveProjectMutation = useMutation({
        mutationFn: async (data: ProjectForm) => {
            if (data._id) {
                const res = await axios.put(`/showcase-projects/${data._id}`, data);
                return res.data;
            } else {
                const res = await axios.post('/showcase-projects', data);
                return res.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['showcase-projects-admin'] });
            toast.success(formData._id ? 'Proje güncellendi' : 'Proje oluşturuldu');
            setActiveTab('list');
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Kaydetme hatası');
        },
    });

    // Delete project mutation
    const deleteProjectMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/showcase-projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['showcase-projects-admin'] });
            toast.success('Proje silindi');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Silme hatası');
        },
    });

    // Media upload
    const handleMediaUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !mediaPickerFor) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadFile);

        try {
            const res = await axios.post('/media/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Medya yüklendi');
            const url = res.data.data.url;

            if (mediaPickerFor === 'cover') {
                setFormData(prev => ({ ...prev, coverUrl: url }));
            } else if (mediaPickerFor === 'video') {
                setFormData(prev => ({ ...prev, videoUrl: url }));
            } else if (mediaPickerFor === 'images') {
                setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
            }

            setUploadFile(null);
            setMediaPickerFor(null);
            refetchMedia();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Yükleme hatası');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSelectMedia = (url: string) => {
        if (mediaPickerFor === 'cover') {
            setFormData(prev => ({ ...prev, coverUrl: url }));
            setMediaPickerFor(null);
        } else if (mediaPickerFor === 'video') {
            setFormData(prev => ({ ...prev, videoUrl: url }));
            setMediaPickerFor(null);
        } else if (mediaPickerFor === 'images') {
            // For multi-select, toggle selection
            setSelectedImages(prev =>
                prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
            );
        }
    };

    const confirmImageSelection = () => {
        setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...selectedImages],
            coverUrl: prev.coverUrl || selectedImages[0] || '' // Auto-set cover to first image
        }));
        setSelectedImages([]);
        setMediaPickerFor(null);
    };

    const handleEditProject = (project: any) => {
        setFormData({
            _id: project._id,
            type: project.type || 'photo',
            title: project.title,
            category: project.category,
            description: project.description || '',
            coverUrl: project.coverUrl || '',
            imageUrls: project.imageUrls || [],
            videoUrl: project.videoUrl || '',
            order: project.order || 0,
            isActive: project.isActive !== undefined ? project.isActive : true,
        });
        setActiveTab('form');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveProjectMutation.mutate(formData);
    };

    const resetForm = () => {
        setFormData({
            type: 'photo',
            title: '',
            category: 'Konser',
            description: '',
            coverUrl: '',
            imageUrls: [],
            videoUrl: '',
            order: 0,
            isActive: true,
        });
        setSelectedImages([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Projeler Yönetimi
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'list'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <Grid className="w-4 h-4 inline-block mr-2" />
                        Proje Listesi
                    </button>
                    <button
                        onClick={() => { setActiveTab('form'); resetForm(); }}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'form'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <Plus className="w-4 h-4 inline-block mr-2" />
                        {formData._id ? 'Düzenle' : 'Yeni Ekle'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* LIST TAB */}
                    {activeTab === 'list' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isProjectsLoading ? (
                                <div className="col-span-full flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : projectsData?.data?.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    Henüz proje eklenmemiş. &quot;Yeni Ekle&quot; sekmesinden proje oluşturun.
                                </div>
                            ) : (
                                projectsData?.data?.map((project: any) => (
                                    <div
                                        key={project._id}
                                        className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {project.coverUrl && (
                                            <img
                                                src={project.coverUrl}
                                                alt={project.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                                    {project.category}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {project.type === 'photo' ? '📸 Fotoğraf' : '🎬 Video'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-4">
                                                <button
                                                    onClick={() => handleEditProject(project)}
                                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
                                                            deleteProjectMutation.mutate(project._id);
                                                        }
                                                    }}
                                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* FORM TAB */}
                    {activeTab === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/*Project Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Proje Tipi *
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'photo' }))}
                                        className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${formData.type === 'photo'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <Image className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm font-semibold">Fotoğraf Albümü</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'video' }))}
                                        className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${formData.type === 'video'
                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <Video className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm font-semibold">Video Prodüksiyonu</div>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Proje Başlığı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Örn: X Sanatçısı Harbiye Konseri"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Proje hakkında kısa açıklama..."
                                />
                            </div>

                            {/* CONDITIONAL MEDIA SELECTION */}
                            {formData.type === 'photo' ? (
                                /* PHOTO PROJECT MEDIA */
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Galeri Görselleri *
                                    </label>

                                    {formData.imageUrls.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-3">
                                                {formData.imageUrls.map((url, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={url} alt={`Resim ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
                                                            }))}
                                                            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        {idx === 0 && (
                                                            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                                                Kapak
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setMediaPickerFor('images'); setMediaTab('library'); setSelectedImages([]); }}
                                                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-sm text-gray-600 dark:text-gray-400"
                                            >
                                                + Daha Fazla Resim Ekle
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => { setMediaPickerFor('images'); setMediaTab('library'); setSelectedImages([]); }}
                                            className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                                        >
                                            <Images className="w-8 h-8 text-gray-400" />
                                            <span className="text-sm text-gray-500">Görselleri Seç</span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                /* VIDEO PROJECT MEDIA */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Video */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Video Dosyası *
                                        </label>
                                        {formData.videoUrl ? (
                                            <div className="relative group">
                                                <video src={formData.videoUrl} className="w-full h-48 object-cover rounded-lg" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setMediaPickerFor('video'); setMediaTab('library'); }}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Değiştir
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setMediaPickerFor('video'); setMediaTab('library'); }}
                                                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                                            >
                                                <Film className="w-8 h-8 text-gray-400" />
                                                <span className="text-sm text-gray-500">Video Seç</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kapak Görseli (Poster) *
                                        </label>
                                        {formData.coverUrl ? (
                                            <div className="relative group">
                                                <img src={formData.coverUrl} alt="Kapak" className="w-full h-48 object-cover rounded-lg" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setMediaPickerFor('cover'); setMediaTab('library'); }}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Değiştir
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, coverUrl: '' }))}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                    >
                                                        Kaldır
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setMediaPickerFor('cover'); setMediaTab('library'); }}
                                                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors"
                                            >
                                                <Image className="w-8 h-8 text-gray-400" />
                                                <span className="text-sm text-gray-500">Kapak Seç</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Order & Active */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Sıra No
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Aktif</span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab('list'); resetForm(); }}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveProjectMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {saveProjectMutation.isPending ? (
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
                {mediaPickerFor && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-10">
                        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold">
                                    {mediaPickerFor === 'cover' ? 'Kapak Görseli Seç' :
                                        mediaPickerFor === 'video' ? 'Video Seç' :
                                            'Galeri Görselleri Seç'}
                                </h3>
                                <button onClick={() => { setMediaPickerFor(null); setSelectedImages([]); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
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
                                            Henüz medya yüklenmemiş. &quot;Yükle&quot; sekmesinden ekleyin.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {mediaData?.data?.map((item: any) => (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => handleSelectMedia(item.url)}
                                                        className={`relative group aspect-video rounded-lg overflow-hidden transition-all ${selectedImages.includes(item.url)
                                                                ? 'ring-4 ring-blue-500'
                                                                : 'hover:ring-2 hover:ring-blue-500'
                                                            }`}
                                                    >
                                                        {item.type === 'image' ? (
                                                            <img src={item.url} alt={item.name || 'Media'} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <video src={item.url} className="w-full h-full object-cover" title={item.name || 'Video'} />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-sm font-medium">
                                                                {mediaPickerFor === 'images' && selectedImages.includes(item.url) ? '✓ Seçildi' : 'Seç'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Multi-select confirm button */}
                                            {mediaPickerFor === 'images' && selectedImages.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <button
                                                        onClick={confirmImageSelection}
                                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                                                    >
                                                        {selectedImages.length} Resim Ekle
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )
                                ) : (
                                    <form onSubmit={handleMediaUpload} className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                                            <input
                                                type="file"
                                                accept={mediaPickerFor === 'video' ? 'video/*' : 'image/*'}
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

export default ProjectsSectionModal;
