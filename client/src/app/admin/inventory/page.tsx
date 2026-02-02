'use client';

import React, { useState, useEffect } from 'react';
import inventoryService, { InventoryItem, Category, Location } from '@/services/inventoryService';
import AddItemModal from '@/components/admin/inventory/AddItemModal';
import EditItemModal from '@/components/admin/inventory/EditItemModal';
import { Pencil, QrCode, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import AssignProjectModal from '@/components/admin/inventory/AssignProjectModal';
import ReturnModal from '@/components/admin/inventory/ReturnModal';
import QRCodeModal from '@/components/admin/inventory/QRCodeModal';
import ImportModal from '@/components/admin/ImportModal';
import ExportMenu from '@/components/admin/ExportMenu';
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
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [assignItem, setAssignItem] = useState<InventoryItem | null>(null);
    const [returnItem, setReturnItem] = useState<InventoryItem | null>(null);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

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

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu ekipmanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                await inventoryService.deleteItem(id);
                toast.success('Ekipman başarıyla silindi');
                fetchData();
            } catch (error) {
                toast.error('Silme işlemi sırasında bir hata oluştu');
            }
        }
    };

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

    const getCategoryName = (category: any) => {
        if (!category) return '-';
        // Handle if category is just an ID string
        if (typeof category === 'string') return '-';

        // Handle if category is an object
        if (typeof category === 'object') {
            // Check if name exists
            if ('name' in category) {
                const name = category.name;
                // Ensure name is a primitive
                if (typeof name === 'string' || typeof name === 'number') {
                    return String(name);
                }
                // If name is somehow an object?
                return '-';
            }
            return '-';
        }
        return '-';
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Envanter Yönetimi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Ekipman takibi ve stok yönetimi</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        İçe Aktar
                    </button>
                    <ExportMenu type="inventory" baseFilename="inventory" label="Dışa Aktar" />
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
                        <option key={cat._id} value={cat._id}>{String(cat.name)}</option>
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
                                        {getCategoryName(item.category)}
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
                                            {/* Assign / Return Buttons */}
                                            {item.status === 'AVAILABLE' && (
                                                <button
                                                    onClick={() => setAssignItem(item)}
                                                    className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg tooltip"
                                                    title="Projeye Çık"
                                                >
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </button>
                                            )}
                                            {item.status === 'IN_USE' && (
                                                <button
                                                    onClick={() => setReturnItem(item)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg tooltip"
                                                    title="İade Al"
                                                >
                                                    <ArrowDownLeft className="w-5 h-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => setEditItem(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg tooltip"
                                                title="Düzenle"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setQrItem(item)}
                                                className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg tooltip"
                                                title="QR Kod"
                                            >
                                                <QrCode className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg tooltip"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
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
            <ImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchData}
                type="inventory"
                title="Envanter İçe Aktar"
            />

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
                categories={categories}
                locations={locations}
            />

            <EditItemModal
                isOpen={!!editItem}
                onClose={() => setEditItem(null)}
                onSuccess={fetchData}
                item={editItem}
                categories={categories}
            />

            <QRCodeModal
                isOpen={!!qrItem}
                onClose={() => setQrItem(null)}
                item={qrItem}
            />

            <AssignProjectModal
                isOpen={!!assignItem}
                onClose={() => setAssignItem(null)}
                onSuccess={fetchData}
                item={assignItem}
            />

            <ReturnModal
                isOpen={!!returnItem}
                onClose={() => setReturnItem(null)}
                onSuccess={fetchData}
                item={returnItem}
            />
        </div>
    );
}
