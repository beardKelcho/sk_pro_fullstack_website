import React, { useState, useEffect } from 'react';
import inventoryService, { Category, Location } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: Category[];
    locations: Location[];
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSuccess, categories, locations }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        location: '',
        trackingType: 'BULK', // or 'SERIALIZED'
        quantity: 1,
        serialNumber: '',
        brand: '',
        model: '',
        criticalStockLevel: 0,
        status: 'AVAILABLE',
        subComponents: [] as any[]
    });
    const [subComponent, setSubComponent] = useState({ name: '', type: 'GPU', serialNumber: '', specs: '' });
    const [isSystemBuilderActive, setIsSystemBuilderActive] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                category: categories[0]?._id || '',
                location: locations[0]?._id || '',
                trackingType: 'BULK',
                quantity: 1,
                serialNumber: '',
                brand: '',
                model: '',
                criticalStockLevel: 0,
                status: 'AVAILABLE',
                subComponents: []
            });
            setSubComponent({ name: '', type: 'GPU', serialNumber: '', specs: '' });
            setIsSystemBuilderActive(false);
        }
    }, [isOpen, categories, locations]);

    // Watch for "Custom PC" or similar categories
    useEffect(() => {
        const selectedCat = categories.find(c => c._id === formData.category);
        if (selectedCat && (selectedCat.name.toLowerCase().includes('pc') || selectedCat.name.toLowerCase().includes('bilgisayar') || selectedCat.name.toLowerCase().includes('system'))) {
            setIsSystemBuilderActive(true);
        } else {
            setIsSystemBuilderActive(false);
        }
    }, [formData.category, categories]);

    const addSubComponent = () => {
        if (!subComponent.name || !subComponent.type) return;
        setFormData({
            ...formData,
            subComponents: [...(formData.subComponents || []), subComponent]
        });
        setSubComponent({ name: '', type: 'GPU', serialNumber: '', specs: '' });
    };

    const removeSubComponent = (index: number) => {
        const newComponents = [...(formData.subComponents || [])];
        newComponents.splice(index, 1);
        setFormData({ ...formData, subComponents: newComponents });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await inventoryService.createItem(formData as any);
            toast.success('Ürün başarıyla eklendi');
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Ürün Ekle</h2>
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
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori *</label>
                                <select
                                    required
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konum *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="">Seçiniz</option>
                                    {locations.map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Takip Tipi *</label>
                                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                    <button
                                        type="button"
                                        className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${formData.trackingType === 'BULK'
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        onClick={() => setFormData({ ...formData, trackingType: 'BULK', quantity: 1, serialNumber: '' })}
                                    >
                                        Adetli (Bulk)
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-1 rounded-md text-sm font-medium transition-all ${formData.trackingType === 'SERIALIZED'
                                            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        onClick={() => setFormData({ ...formData, trackingType: 'SERIALIZED', quantity: 1 })}
                                    >
                                        Seri No (Serialized)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Fields Based on Tracking Type */}
                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            {formData.trackingType === 'SERIALIZED' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seri Numarası *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                            required
                                            min="1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        />
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
                            )}
                        </div>

                        {/* System Builder Section */}
                        {isSystemBuilderActive && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                                    <span className="mr-2">🖥️</span> System Builder
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Bileşen Adı (örn: RTX 4090)"
                                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={subComponent.name}
                                        onChange={e => setSubComponent({ ...subComponent, name: e.target.value })}
                                    />
                                    <select
                                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={subComponent.type}
                                        onChange={e => setSubComponent({ ...subComponent, type: e.target.value })}
                                    >
                                        <option value="GPU">GPU</option>
                                        <option value="CPU">CPU</option>
                                        <option value="RAM">RAM</option>
                                        <option value="Motherboard">Anakart</option>
                                        <option value="Storage">Depolama</option>
                                        <option value="PSU">PSU</option>
                                        <option value="Case">Kasa</option>
                                        <option value="Cooling">Soğutma</option>
                                        <option value="Other">Diğer</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Seri No (Opsiyonel)"
                                        className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={subComponent.serialNumber}
                                        onChange={e => setSubComponent({ ...subComponent, serialNumber: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={addSubComponent}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        Ekle
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.subComponents?.map((comp, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border dark:border-gray-700">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-gray-700 dark:text-gray-300 w-24">{comp.type}</span>
                                                <span className="text-gray-900 dark:text-white">{comp.name}</span>
                                                {comp.serialNumber && <span className="text-gray-500 text-sm">({comp.serialNumber})</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSubComponent(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.subComponents || formData.subComponents.length === 0) && (
                                        <p className="text-sm text-gray-500 italic text-center py-2">Henüz bileşen eklenmedi.</p>
                                    )}
                                </div>
                            </div>
                        )}

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
                                {loading ? 'Ekleniyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddItemModal;
