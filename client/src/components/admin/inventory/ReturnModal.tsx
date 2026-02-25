import logger from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import inventoryService, { InventoryItem } from '@/services/inventoryService';
import { toast } from 'react-toastify';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: InventoryItem | null;
}

export default function ReturnModal({ isOpen, onClose, onSuccess, item }: ReturnModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen && item) {
            setQuantity(1);
        }
    }, [isOpen, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;

        setSubmitting(true);
        try {
            await inventoryService.returnToWarehouse({
                equipmentId: item._id,
                quantity: quantity
            });
            toast.success('Ekipman depoya iade edildi');
            onSuccess();
            onClose();
        } catch (error: any) {
            logger.error(error);
            toast.error(error.response?.data?.message || 'İade işlemi başarısız');
        } finally {
            setSubmitting(false);
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
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Projeden İade Al
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {item && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                <p><span className="font-semibold">Ekipman:</span> {item.name}</p>
                                <p><span className="font-semibold">Mevcut Stok (Projede):</span> {item.quantity}</p>
                            </div>
                        )}

                        {item?.trackingType === 'BULK' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    İade Edilecek Miktar
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={item?.quantity}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-gray-700 dark:text-white"
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                />
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                            <p>Bu işlem ürünü tekrar <strong>Merkez Depo</strong> stoğuna ekleyecektir.</p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                disabled={submitting}
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                disabled={submitting}
                            >
                                {submitting ? 'İade Alınıyor...' : 'İade Al'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
