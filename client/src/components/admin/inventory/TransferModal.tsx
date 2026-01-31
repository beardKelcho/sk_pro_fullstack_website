import React, { useState, useEffect } from 'react';
import inventoryService, { InventoryItem, Location } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: InventoryItem | null;
    locations: Location[];
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess, item, locations }) => {
    const [targetLocation, setTargetLocation] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTargetLocation('');
            setQuantity(1);
        }
    }, [isOpen, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;

        setLoading(true);
        try {
            await inventoryService.transferStock({
                equipmentId: item._id,
                targetLocationId: targetLocation,
                quantity: quantity
            });
            toast.success('Transfer işlemi başarılı');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Transfer başarısız');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !item) return null;

    const currentLocationId = typeof item.location === 'object' ? item.location._id : item.location;
    const currentLocationName = typeof item.location === 'object' ? item.location.name : 'Mevcut Konum';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg"
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stok Transferi</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.name} {item.brand && `- ${item.brand}`}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Mevcut Konum</span>
                                <div className="font-medium text-gray-900 dark:text-white mt-1">{currentLocationName}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Stokta</span>
                                <div className="font-bold text-2xl text-blue-700 dark:text-blue-300">{item.quantity}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hedef Lokasyon</label>
                            <select
                                required
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={targetLocation}
                                onChange={e => setTargetLocation(e.target.value)}
                            >
                                <option value="">Seçiniz...</option>
                                {locations
                                    .filter(l => l._id !== currentLocationId)
                                    .map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                                    ))}
                            </select>
                        </div>

                        {item.trackingType === 'BULK' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transfer Miktarı</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max={item.quantity}
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value))}
                                        className="flex-1"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.quantity}
                                        className="w-20 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                                        value={quantity}
                                        onChange={e => setQuantity(Math.min(parseInt(e.target.value) || 1, item.quantity))}
                                    />
                                </div>
                            </div>
                        )}

                        {item.trackingType === 'SERIALIZED' && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg border border-yellow-200 dark:border-yellow-800">
                                Bu işlem seri numaralı cihazı ({item.serialNumber}) yeni konuma taşıyacaktır.
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !targetLocation}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                            >
                                <span>Transfer Et</span>
                                {loading && <span className="animate-spin">⌛</span>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TransferModal;
