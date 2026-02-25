import React, { useState, useEffect } from 'react';
import inventoryService, { Category, InventoryItem } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: InventoryItem | null;
    categories: Category[];
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSuccess, item, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        serialNumber: '',
        brand: '',
        model: '',
        criticalStockLevel: 0,
        status: 'AVAILABLE',
        subComponents: [] as any[]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                name: item.name,
                category: typeof item.category === 'object' ? item.category._id : item.category,
                serialNumber: item.serialNumber || '',
                brand: item.brand || '',
                model: item.model || '',
                criticalStockLevel: item.criticalStockLevel || 0,
                status: item.status,
                subComponents: item.subComponents || []
            });
        }
    }, [isOpen, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;

        setLoading(true);
        try {
            await inventoryService.updateItem(item._id, formData as any);
            toast.success('Ürün başarıyla güncellendi');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ürünü Düzenle</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ürün Adı *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marka</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">Müsait</option>
                                    <option value="IN_USE">Kullanımda</option>
                                    <option value="MAINTENANCE">Bakımda</option>
                                    <option value="RETIRED">Emekli</option>
                                    <option value="MISSING">Kayıp</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kritik Stok Uyarı Limiti</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.criticalStockLevel}
                                    onChange={e => setFormData({ ...formData, criticalStockLevel: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Sub Components Section */}
                        <div className="mt-6 border-t pt-4 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Alt Bileşenler / Parçalar</h3>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        subComponents: [...(formData.subComponents || []), { name: '', type: '', serialNumber: '' }]
                                    })}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    + Parça Ekle
                                </button>
                            </div>

                            {formData.subComponents?.length > 0 ? (
                                <div className="space-y-3">
                                    {formData.subComponents.map((comp: any, index: number) => (
                                        <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Parça Adı (örn: RTX 3060)"
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={comp.name}
                                                    onChange={(e) => {
                                                        const newComps = [...formData.subComponents];
                                                        newComps[index].name = e.target.value;
                                                        setFormData({ ...formData, subComponents: newComps });
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Tür (GPU, RAM vb.)"
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={comp.type}
                                                    onChange={(e) => {
                                                        const newComps = [...formData.subComponents];
                                                        newComps[index].type = e.target.value;
                                                        setFormData({ ...formData, subComponents: newComps });
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Seri No (Opsiyonel)"
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    value={comp.serialNumber || ''}
                                                    onChange={(e) => {
                                                        const newComps = [...formData.subComponents];
                                                        newComps[index].serialNumber = e.target.value;
                                                        setFormData({ ...formData, subComponents: newComps });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newComps = formData.subComponents.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, subComponents: newComps });
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Sil"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Henüz eklenmiş alt parça yok.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {loading ? 'Güncelleniyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditItemModal;
