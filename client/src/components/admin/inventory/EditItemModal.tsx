import React, { useState, useEffect } from 'react';
import inventoryService, { Category, InventoryItem } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Loader2 } from 'lucide-react';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: InventoryItem | null;
    categories: Category[];
    onCategoriesChange?: (categories: Category[]) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, onSuccess, item, categories, onCategoriesChange }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        serialNumber: '',
        brand: '',
        model: '',
        quantity: 1,
        trackingType: 'BULK' as 'BULK' | 'SERIALIZED',
        criticalStockLevel: 0,
        status: 'AVAILABLE',
        subComponents: [] as any[]
    });
    const [loading, setLoading] = useState(false);

    // Inline category creation state
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [savingCat, setSavingCat] = useState(false);
    const [localCategories, setLocalCategories] = useState<Category[]>(categories);

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                name: item.name,
                category: typeof item.category === 'object' ? item.category._id : item.category,
                serialNumber: item.serialNumber || '',
                brand: item.brand || '',
                model: item.model || '',
                quantity: item.quantity ?? 1,
                trackingType: item.trackingType || 'BULK',
                criticalStockLevel: item.criticalStockLevel || 0,
                status: item.status,
                subComponents: item.subComponents || []
            });
            setShowNewCat(false);
            setNewCatName('');
        }
    }, [isOpen, item]);

    const handleCreateCategory = async () => {
        if (!newCatName.trim()) return;
        setSavingCat(true);
        try {
            const res = await inventoryService.createCategory({ name: newCatName.trim() });
            const created: Category = res.data || res;
            const updated = [...localCategories, created];
            setLocalCategories(updated);
            onCategoriesChange?.(updated);
            setFormData(prev => ({ ...prev, category: created._id }));
            setNewCatName('');
            setShowNewCat(false);
            toast.success(`"${created.name}" kategorisi oluşturuldu`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Kategori oluşturulamadı');
        } finally {
            setSavingCat(false);
        }
    };

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
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Row 1 – Name + Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ürün Adı *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori *</label>
                                {showNewCat ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Yeni kategori adı"
                                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newCatName}
                                            onChange={e => setNewCatName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            disabled={savingCat || !newCatName.trim()}
                                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                        >
                                            {savingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowNewCat(false); setNewCatName(''); }}
                                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">Seçiniz</option>
                                            {localCategories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCat(true)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-700"
                                            title="Yeni Kategori Ekle"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 2 – Brand + Model */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marka</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tracking Type Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Takip Tipi</label>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
                                <button
                                    type="button"
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.trackingType === 'BULK'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'}`}
                                    onClick={() => setFormData({ ...formData, trackingType: 'BULK', serialNumber: '' })}
                                >
                                    Adetli (Bulk)
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.trackingType === 'SERIALIZED'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'}`}
                                    onClick={() => setFormData({ ...formData, trackingType: 'SERIALIZED', quantity: 1 })}
                                >
                                    Seri No (Serialized)
                                </button>
                            </div>
                        </div>

                        {/* Dynamic: Serial Number or Quantity */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            {formData.trackingType === 'SERIALIZED' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seri Numarası *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="SN-12345678"
                                        value={formData.serialNumber}
                                        onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Seri numaralı ürünler tekil olarak takip edilir (Adet: 1)</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok Adedi *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kritik Stok Limiti</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.criticalStockLevel}
                                            onChange={e => setFormData({ ...formData, criticalStockLevel: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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

                        {/* Sub Components Section */}
                        <div className="border-t pt-4 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Alt Bileşenler / Parçalar</h3>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        subComponents: [...(formData.subComponents || []), { name: '', type: '', serialNumber: '' }]
                                    })}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Parça Ekle
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
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
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
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
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
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
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
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Henüz eklenmiş alt parça yok.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
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
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Güncelleniyor...</> : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditItemModal;
