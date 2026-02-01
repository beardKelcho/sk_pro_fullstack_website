import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { QrCode, Search, ShoppingCart, X, Plus } from 'lucide-react';
import QRScanner from '../QRScanner';
import inventoryService from '@/services/inventoryService';

interface EquipmentSelectorProps {
    selectedEquipment: string[];
    onSelectionChange: (ids: string[]) => void;
}

export default function EquipmentSelector({ selectedEquipment, onSelectionChange }: EquipmentSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

    // Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => inventoryService.getCategories()
    });
    const categories = categoriesData?.categories || [];

    // Fetch Inventory
    const { data: inventoryData } = useQuery({
        queryKey: ['inventory', activeCategory, searchTerm],
        queryFn: () => inventoryService.getItems({
            category: activeCategory === 'all' ? undefined : activeCategory,
            search: searchTerm,
            // status: 'AVAILABLE', // Removed to show all equipment
            limit: 50 // Loaded per scroll or max? Keeping simple for now
        }),
        staleTime: 60000
    });
    const items = inventoryData?.data || [];

    // Handle QR Scan
    const handleScanSuccess = (result: any) => {
        if (result.equipment) {
            const eqId = result.equipment._id;
            // Check if already selected
            if (selectedEquipment.includes(eqId)) {
                toast.warning('Bu ekipman zaten listede.');
                // Play error sound?
            } else if (result.equipment.status !== 'AVAILABLE') {
                toast.error(`Ekipman müsait değil: ${result.equipment.status}`);
            } else {
                onSelectionChange([...selectedEquipment, eqId]);
                toast.success(`${result.equipment.name} eklendi.`);
                // Play beep sound
                const audio = new Audio('/sounds/beep.mp3'); // Assuming file exists or fails silently
                audio.play().catch(e => { });
            }
        }
    };

    const toggleSelection = (id: string) => {
        if (selectedEquipment.includes(id)) {
            onSelectionChange(selectedEquipment.filter(eqId => eqId !== id));
        } else {
            onSelectionChange([...selectedEquipment, id]);
        }
    };

    // Derived state for basket items (needs full objects, but we only have IDs in prop)
    // We can find them in the `items` list if loaded, but better to maybe fetch details or assume user can see count.
    // For "Right Panel" we need names.
    // Option: Keep a local map of Id -> Item, updated when items fetched or scanned.
    const [itemMap, setItemMap] = useState<Record<string, any>>({});

    useEffect(() => {
        if (items.length > 0) {
            const newMap = { ...itemMap };
            items.forEach((item: any) => {
                newMap[item._id] = item;
            });
            setItemMap(newMap);
        }
        // Also add scanned items to map? 
        // Logic: if handleScanSuccess returns item, add to map.
    }, [items]);

    // Update map manually on scan success if item not in list
    const handleScanSuccessWithMapUpdate = (result: any) => {
        if (result.equipment) {
            setItemMap(prev => ({ ...prev, [result.equipment._id]: result.equipment }));
            handleScanSuccess(result);
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            {/* Header / Tools */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Ekipman ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsQRScannerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <QrCode className="w-5 h-5" />
                    <span>QR ile Ekle</span>
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Categories */}
                <div className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden md:block">
                    <div className="p-2">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`w-full text-left px-3 py-2 rounded-md mb-1 text-sm font-medium ${activeCategory === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            Tümü
                        </button>
                        {categories.map((cat: any) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveCategory(cat._id)}
                                className={`w-full text-left px-3 py-2 rounded-md mb-1 text-sm font-medium truncate ${activeCategory === cat._id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center Panel: Equipment Grid */}
                <div className="flex-1 overflow-y-auto p-4 content-start">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item: any) => (
                            <div
                                key={item._id}
                                onClick={() => toggleSelection(item._id)}
                                className={`
                                    cursor-pointer p-3 rounded-lg border transition-all relative
                                    ${selectedEquipment.includes(item._id)
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate pr-2">{item.name}</h3>
                                    {selectedEquipment.includes(item._id) && (
                                        <span className="bg-blue-500 text-white p-0.5 rounded-full">
                                            <Plus className="w-3 h-3 rotate-45" /> {/* Checkmark logic if needed */}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.model || '-'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        Adet: {item.quantity}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                Ekipman bulunamadı.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Basket */}
                <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Seçilenler ({selectedEquipment.length})</span>
                        </div>
                        {selectedEquipment.length > 0 && (
                            <button
                                onClick={() => onSelectionChange([])}
                                className="text-xs text-red-500 hover:text-red-600"
                            >
                                Temizle
                            </button>
                        )}
                    </div>
                    <div className="p-2 space-y-2 flex-1">
                        {selectedEquipment.map(id => {
                            const item = itemMap[id];
                            return (
                                <div key={id} className="group flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                                    <div className="truncate flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {item?.name || 'Yükleniyor...'}
                                        </div>
                                        <div className="text-xs text-gray-500">{item?.serialNumber || id.slice(-6)}</div>
                                    </div>
                                    <button
                                        onClick={() => toggleSelection(id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {selectedEquipment.length === 0 && (
                            <div className="text-center py-8 text-sm text-gray-400 px-4">
                                QR okutarak veya listeden seçerek ekleyin.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal */}
            {isQRScannerOpen && (
                <QRScanner
                    onClose={() => setIsQRScannerOpen(false)}
                    onScanSuccess={(result) => handleScanSuccessWithMapUpdate(result)}
                />
            )}
        </div>
    );
}
