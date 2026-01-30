import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from '@/services/api/axios';
import { toast } from 'react-toastify';
import { X, Save, Loader2, Grid, Plus, Edit2, Trash2, Monitor, Server, Cpu, Layers, Activity } from 'lucide-react';

interface ServicesSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ServiceForm {
    _id?: string;
    title: string;
    category: string;
    description: string;
    icon: string;
    details: string[];
    order: number;
    isActive: boolean;
}

const CATEGORIES = [
    'Video Processing',
    'LED Management',
    'Signal Processing',
    'Technical Design & Simulation',
    'Media Server Operating',
    'Presentation Systems',
    'Pixel Mapping'
];
const ICON_OPTIONS = [
    { name: 'Monitor', icon: Monitor },
    { name: 'Server', icon: Server },
    { name: 'Cpu', icon: Cpu },
    { name: 'Layers', icon: Layers },
    { name: 'Activity', icon: Activity },
];

const ServicesSectionModal: React.FC<ServicesSectionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Main tabs
    const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

    // Form state
    const [formData, setFormData] = useState<ServiceForm>({
        title: '',
        category: 'Video Processing',
        description: '',
        icon: 'Monitor',
        details: [],
        order: 0,
        isActive: true,
    });

    // Temporary detail input
    const [newDetail, setNewDetail] = useState('');

    // Fetch services
    const { data: servicesData, isLoading: isServicesLoading } = useQuery({
        queryKey: ['services-admin'],
        queryFn: async () => {
            const res = await axios.get('/services');
            return res.data;
        },
        enabled: isOpen,
    });

    // Create/Update service mutation
    const saveServiceMutation = useMutation({
        mutationFn: async (data: ServiceForm) => {
            if (data._id) {
                const res = await axios.put(`/services/${data._id}`, data);
                return res.data;
            } else {
                const res = await axios.post('/services', data);
                return res.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services-admin'] });
            toast.success(formData._id ? 'Hizmet güncellendi' : 'Hizmet oluşturuldu');
            setActiveTab('list');
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Kaydetme hatası');
        },
    });

    // Delete service mutation
    const deleteServiceMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/services/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services-admin'] });
            toast.success('Hizmet silindi');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Silme hatası');
        },
    });

    const handleEditService = (service: any) => {
        setFormData({
            _id: service._id,
            title: service.title,
            category: service.category,
            description: service.description || '',
            icon: service.icon || 'Monitor',
            details: service.details || [],
            order: service.order || 0,
            isActive: service.isActive !== undefined ? service.isActive : true,
        });
        setActiveTab('form');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveServiceMutation.mutate(formData);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'Video Processing',
            description: '',
            icon: 'Monitor',
            details: [],
            order: 0,
            isActive: true,
        });
        setNewDetail('');
    };

    const addDetail = () => {
        if (newDetail.trim()) {
            setFormData(prev => ({
                ...prev,
                details: [...prev.details, newDetail.trim()],
            }));
            setNewDetail('');
        }
    };

    const removeDetail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index),
        }));
    };

    const getIconComponent = (iconName: string) => {
        const icon = ICON_OPTIONS.find(opt => opt.name === iconName);
        return icon ? icon.icon : Monitor;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Hizmetler Yönetimi
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
                        Hizmet Listesi
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
                        <div className="space-y-6">
                            {/* Services Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isServicesLoading ? (
                                    <div className="col-span-full flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : servicesData?.data?.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        Henüz hizmet eklenmemiş. &quot;Yeni Ekle&quot; sekmesinden hizmet oluşturun.
                                    </div>
                                ) : (
                                    servicesData?.data?.map((service: any) => {
                                        const IconComponent = getIconComponent(service.icon);
                                        return (
                                            <div
                                                key={service._id}
                                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                {/* Icon & Title */}
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                                                        <IconComponent className="w-6 h-6 text-cyan-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                                            {service.title}
                                                        </h3>
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                                            {service.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Details Preview */}
                                                {service.details && service.details.length > 0 && (
                                                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div className="space-y-1">
                                                            {service.details.slice(0, 3).map((detail: string, idx: number) => (
                                                                <div key={idx} className="flex items-start gap-2">
                                                                    <span className="text-cyan-400 mt-1">▸</span>
                                                                    <span className="line-clamp-1">{detail}</span>
                                                                </div>
                                                            ))}
                                                            {service.details.length > 3 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{service.details.length - 3} daha...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditService(service)}
                                                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
                                                                deleteServiceMutation.mutate(service._id);
                                                            }
                                                        }}
                                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* FORM TAB */}
                    {activeTab === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                            {/* Title & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hizmet Başlığı *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Örn: Analog Way Aquilon"
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
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Kısa teknik açıklama..."
                                />
                            </div>

                            {/* Icon Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    İkon
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {ICON_OPTIONS.map(option => {
                                        const IconComponent = option.icon;
                                        return (
                                            <button
                                                key={option.name}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, icon: option.name }))}
                                                className={`p-4 rounded-lg border-2 transition-all ${formData.icon === option.name
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <IconComponent className={`w-8 h-8 mx-auto ${formData.icon === option.name ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Technical Details (Dynamic List) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Teknik Özellikler
                                </label>

                                {/* Existing Details */}
                                {formData.details.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {formData.details.map((detail, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                <span className="text-cyan-400">▸</span>
                                                <span className="flex-1 text-gray-900 dark:text-white">{detail}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDetail(index)}
                                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add New Detail */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newDetail}
                                        onChange={(e) => setNewDetail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addDetail();
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Örn: 4x 4K 60Hz Output"
                                    />
                                    <button
                                        type="button"
                                        onClick={addDetail}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Ekle
                                    </button>
                                </div>
                            </div>

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
                                    disabled={saveServiceMutation.isPending}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {saveServiceMutation.isPending ? (
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
            </div>
        </div>
    );
};

export default ServicesSectionModal;
