'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import inventoryService, { InventoryItem } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { ArrowLeft, Edit, QrCode } from 'lucide-react';
import EditItemModal from '@/components/admin/inventory/EditItemModal';
import QRCodeModal from '@/components/admin/inventory/QRCodeModal';

export default function InventoryItemView({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [qrItem, setQrItem] = useState<InventoryItem | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemRes, catsRes] = await Promise.all([
                inventoryService.getItem(id),
                inventoryService.getCategories()
            ]);

            // Backend "getItem" returns { success: true, data: ... } or just data depending on controller
            // Controller returns { success: true, data: item } wrapper usually
            const itemData = itemRes.data || itemRes;
            setItem(itemData);
            setCategories(catsRes.data || catsRes);
        } catch (error) {
            console.error(error);
            toast.error('Ekipman detayları alınamadı');
            router.push('/admin/inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!item) return null;

    const getStatusBadge = (status: string) => {
        const colors: any = {
            'AVAILABLE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'IN_USE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'MAINTENANCE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'RETIRED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'MISSING': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
        const labels: any = {
            'AVAILABLE': 'Müsait',
            'IN_USE': 'Kullanımda',
            'MAINTENANCE': 'Bakımda',
            'RETIRED': 'Emekli',
            'MISSING': 'Kayıp'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getCategoryName = (cat: any) => {
        if (!cat) return '-';
        if (typeof cat === 'object') return cat.name || '-';
        // Find in categories if we have ID
        const found = categories.find(c => c._id === cat);
        return found ? found.name : cat;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/inventory"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{item.brand} {item.model}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setQrItem(item)}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg tooltip"
                        title="QR Kod"
                    >
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Düzenle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Genel Bilgiler</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Durum</label>
                                <div className="mt-1">{getStatusBadge(item.status)}</div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Kategori</label>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{getCategoryName(item.category)}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Seri Numarası</label>
                                <p className="font-mono text-gray-900 dark:text-white mt-1">{item.serialNumber || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Konum</label>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {typeof item.location === 'object' ? item.location.name : (item.location || '-')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Miktar</label>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{item.quantity} Adet</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Kritik Stok Seviyesi</label>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">{item.criticalStockLevel}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sub Components */}
                    {item.subComponents && item.subComponents.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Alt Bileşenler (System Builder)</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium text-gray-500">Parça</th>
                                            <th className="px-4 py-2 font-medium text-gray-500">Tip</th>
                                            <th className="px-4 py-2 font-medium text-gray-500">Seri No</th>
                                            <th className="px-4 py-2 font-medium text-gray-500">Özellikler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {item.subComponents.map((sub, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-gray-900 dark:text-white">{sub.name}</td>
                                                <td className="px-4 py-2 text-gray-500">{sub.type}</td>
                                                <td className="px-4 py-2 font-mono text-gray-500">{sub.serialNumber || '-'}</td>
                                                <td className="px-4 py-2 text-gray-500">{sub.specs || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* QR Code */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Hızlı İşlemler</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setQrItem(item)}
                                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">QR Kod Görüntüle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchData}
                item={item}
                categories={categories}
            />

            <QRCodeModal
                isOpen={!!qrItem}
                onClose={() => setQrItem(null)}
                item={qrItem}
            />
        </div>
    );
}
