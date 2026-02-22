'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import inventoryService, { InventoryItem, Category, Location } from '@/services/inventoryService';
import AddItemModal from '@/components/admin/inventory/AddItemModal';
import EditItemModal from '@/components/admin/inventory/EditItemModal';
import { Pencil, QrCode, Trash2, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import AssignProjectModal from '@/components/admin/inventory/AssignProjectModal';
import ReturnModal from '@/components/admin/inventory/ReturnModal';
import QRCodeModal from '@/components/admin/inventory/QRCodeModal';
import ImportModal from '@/components/admin/ImportModal';
import ExportMenu from '@/components/admin/ExportMenu';
import { toast } from 'react-toastify';

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    // Pagination & Infinite Scroll State
    const [pagination, setPagination] = useState({ fetchPage: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [assignItem, setAssignItem] = useState<InventoryItem | null>(null);
    const [returnItem, setReturnItem] = useState<InventoryItem | null>(null);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [qrItem, setQrItem] = useState<InventoryItem | null>(null);

    const loadMeta = async () => {
        try {
            const [catsRes, locsRes] = await Promise.all([
                inventoryService.getCategories(),
                inventoryService.getLocations()
            ]);
            setCategories(catsRes.data);
            setLocations(locsRes.data);
        } catch (error) {
            console.error('Meta verileri yüklenemedi', error);
        }
    };

    const fetchData = useCallback(async (pageToFetch = 1, append = false) => {
        if (!append) setLoading(true);
        else setIsFetchingNextPage(true);

        try {
            const res = await inventoryService.getItems({
                page: pageToFetch,
                limit: 50, // Bir defada daha çok veri çekiyoruz (sanallaştırma avantajı)
                search,
                category: selectedCategory,
                location: selectedLocation
            });

            if (append) {
                setItems(prev => {
                    // Prevent duplicates in StrictMode
                    const newItems = res.data.filter((newItem: InventoryItem) => !prev.some(p => p._id === newItem._id));
                    return [...prev, ...newItems];
                });
            } else {
                setItems(res.data);
            }
            setPagination({ fetchPage: pageToFetch, total: res.pagination.total });
        } catch (error) {
            toast.error('Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
            setIsFetchingNextPage(false);
        }
    }, [search, selectedCategory, selectedLocation]);

    useEffect(() => {
        loadMeta();
    }, []);

    useEffect(() => {
        // Debounce search/filters triggering fetch
        const timer = setTimeout(() => {
            fetchData(1, false);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedCategory, selectedLocation, fetchData]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu ekipmanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                await inventoryService.deleteItem(id);
                toast.success('Ekipman başarıyla silindi');
                setItems(prev => prev.filter(item => item._id !== id));
            } catch (error) {
                toast.error('Silme işlemi sırasında bir hata oluştu');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            'AVAILABLE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'IN_USE': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'MAINTENANCE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'RETIRED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'MISSING': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
        const labels: Record<string, string> = {
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

    const getCategoryName = (category: unknown) => {
        if (!category) return '-';
        if (typeof category === 'string') return '-';
        if (typeof category === 'object' && category !== null && 'name' in category) {
            return String((category as { name: unknown }).name);
        }
        return '-';
    };

    // TanStack Table Column Definitions
    const columnHelper = createColumnHelper<InventoryItem>();
    const columns = [
        columnHelper.accessor('name', {
            header: 'Ekipman',
            size: 250,
            cell: info => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{String(info.getValue() || '')}</div>
                    <div className="text-xs text-gray-500 truncate">{String(info.row.original.brand || '')} {String(info.row.original.model || '')}</div>
                </div>
            )
        }),
        columnHelper.accessor('category', {
            header: 'Kategori',
            size: 150,
            cell: info => <span className="text-sm text-gray-600 dark:text-gray-300 truncate block">{getCategoryName(info.getValue())}</span>
        }),
        columnHelper.accessor('location', {
            header: 'Konum',
            size: 150,
            cell: info => {
                const loc = info.getValue() as any;
                if (typeof loc === 'object' && loc !== null) {
                    return (
                        <span className="inline-flex items-center gap-1 text-sm truncate">
                            {loc.type === 'VEHICLE' && '🚚'}
                            {loc.type === 'WAREHOUSE' && '🏢'}
                            {String(loc.name || '')}
                        </span>
                    );
                }
                return '-';
            }
        }),
        columnHelper.display({
            id: 'stock',
            header: 'Stok / Seri No',
            size: 150,
            cell: info => {
                const item = info.row.original;
                if (item.trackingType === 'SERIALIZED') {
                    return <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">{item.serialNumber}</span>
                }
                return <span className={`font-bold ${item.quantity <= item.criticalStockLevel ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{item.quantity} Adet</span>
            }
        }),
        columnHelper.accessor('status', {
            header: 'Durum',
            size: 120,
            cell: info => getStatusBadge(info.getValue())
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-right">İşlemler</div>,
            size: 180,
            cell: info => {
                const item = info.row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {item.status === 'AVAILABLE' && (
                            <button onClick={() => setAssignItem(item)} className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg tooltip" title="Projeye Çık">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        )}
                        {item.status === 'IN_USE' && (
                            <button onClick={() => setReturnItem(item)} className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg tooltip" title="İade Al">
                                <ArrowDownLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => setEditItem(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg tooltip" title="Düzenle">
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => setQrItem(item)} className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg tooltip" title="QR Kod">
                            <QrCode className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg tooltip" title="Sil">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )
            }
        })
    ];

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const parentRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64, // estimated row height
        overscan: 10,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // Intersection observer logic for infinite scrolling
    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;

        if (
            lastItem.index >= items.length - 1 &&
            !isFetchingNextPage &&
            items.length < pagination.total
        ) {
            fetchData(pagination.fetchPage + 1, true);
        }
    }, [virtualItems, isFetchingNextPage, items.length, pagination.total, fetchData, pagination.fetchPage]);


    const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
    const paddingBottom = virtualItems.length > 0
        ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
        : 0;

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
                        className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{String(cat.name)}</option>
                    ))}
                </select>

                <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
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
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium outline-none"
                >
                    Filtreleri Temizle
                </button>
            </div>

            {/* Virtualized Table Container */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div
                    ref={parentRef}
                    className="h-[600px] overflow-auto relative custom-scrollbar"
                >
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" style={{ width: header.column.getSize() }}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading && items.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                <>
                                    {paddingTop > 0 && <tr><td style={{ height: `${paddingTop}px` }} colSpan={columns.length} /></tr>}
                                    {virtualItems.map(virtualRow => {
                                        const row = table.getRowModel().rows[virtualRow.index];
                                        return (
                                            <tr key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                    {paddingBottom > 0 && <tr><td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} /></tr>}
                                </>
                            )}
                        </tbody>
                    </table>

                    {/* Infinite Scroll Loading Indicator */}
                    {isFetchingNextPage && (
                        <div className="flex justify-center items-center py-4 text-blue-500">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span className="text-sm font-medium">Daha fazla yükleniyor...</span>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Gösterilen: {items.length} / Toplam: {pagination.total} Kayıt</span>
                    <span>Sanallaştırma Devrede 🚀</span>
                </div>
            </div>

            {/* Modals */}
            <ImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={() => fetchData(1, false)}
                type="inventory"
                title="Envanter İçe Aktar"
            />

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => fetchData(1, false)}
                categories={categories}
                locations={locations}
            />

            <EditItemModal
                isOpen={!!editItem}
                onClose={() => setEditItem(null)}
                onSuccess={() => fetchData(1, false)}
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
                onSuccess={() => fetchData(1, false)}
                item={assignItem}
            />

            <ReturnModal
                isOpen={!!returnItem}
                onClose={() => setReturnItem(null)}
                onSuccess={() => fetchData(1, false)}
                item={returnItem}
            />
        </div>
    );
}
