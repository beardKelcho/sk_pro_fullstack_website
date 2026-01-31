'use client';

import React, { useState, useEffect } from 'react';
import inventoryService, { InventoryItem, Category, Location } from '@/services/inventoryService';
import AddItemModal from '@/components/admin/inventory/AddItemModal';
import TransferModal from '@/components/admin/inventory/TransferModal';
import { toast } from 'react-toastify';

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    // Pagination
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, catsRes, locsRes] = await Promise.all([
                inventoryService.getItems({
                    page: pagination.page,
                    limit: 10,
                    search,
                    category: selectedCategory,
                    location: selectedLocation
                }),
                inventoryService.getCategories(),
                inventoryService.getLocations()
            ]);

            setItems(itemsRes.data);
            setPagination(itemsRes.pagination);
            setCategories(catsRes.data);
            setLocations(locsRes.data);
        } catch (error) {
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.page, search, selectedCategory, selectedLocation]);

    // Handle Search Debounce in real implementation if needed, for now using direct effect dependecy or button

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
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Envanter Yönetimi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Ekipman takibi ve stok yönetimi</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ara (İsim, Marka, Seri No)..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedLocation}
                    onChange={e => setSelectedLocation(e.target.value)}
                >
                    <option value="">Tüm Lokasyonlar</option>
                    {locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))}
                </select>

                <button
                    onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLocation(''); }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
                >
                    Filtreleri Temizle
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Ekipman</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Konum</th>
                                <th className="px-6 py-4">Stok / Seri No</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.brand} {item.model}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {typeof item.category === 'object' ? item.category.name : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {typeof item.location === 'object' ? (
                                            <span className="inline-flex items-center gap-1">
                                                {item.location.type === 'VEHICLE' && '🚚'}
                                                {item.location.type === 'WAREHOUSE' && '🏢'}
                                                {item.location.name}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.trackingType === 'SERIALIZED' ? (
                                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {item.serialNumber}
                                            </span>
                                        ) : (
                                            <span className={`font-bold ${item.quantity <= item.criticalStockLevel ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                {item.quantity} Adet
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setTransferItem(item)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg tooltip"
                                                title="Transfer Et"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                            </button>
                                            {/* Diğer aksiyonlar (Edit/Delete) buraya eklenebilir */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simple) */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Sayfa {pagination.page} / {pagination.pages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            Önceki
                        </button>
                        <button
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
                categories={categories}
                locations={locations}
            />

            <TransferModal
                isOpen={!!transferItem}
                onClose={() => setTransferItem(null)}
                item={transferItem}
                onSuccess={fetchData}
                locations={locations}
            />
        </div>
    );
}
