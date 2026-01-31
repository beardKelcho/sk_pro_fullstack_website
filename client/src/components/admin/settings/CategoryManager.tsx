import React, { useState, useEffect } from 'react';
import inventoryService, { Category } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus, X, Save } from 'lucide-react';

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getCategories();
            setCategories(res.data);
        } catch (error) {
            toast.error('Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await inventoryService.createCategory({ name: newCategoryName });
            toast.success('Kategori eklendi');
            setNewCategoryName('');
            setIsAdding(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Ekleme başarısız');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;

        try {
            await inventoryService.updateCategory(id, { name: editName });
            toast.success('Kategori güncellendi');
            setEditingId(null);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Güncelleme başarısız');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

        try {
            await inventoryService.deleteCategory(id);
            toast.success('Kategori silindi');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Silme başarısız (Kategori kullanımda olabilir)');
        }
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat._id);
        setEditName(cat.name);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori Yönetimi</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    <Plus className="w-4 h-4" /> Yeni Kategori
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex gap-3">
                    <input
                        type="text"
                        placeholder="Kategori adı..."
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 p-2 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {loading ? (
                    <p className="text-gray-500 text-sm text-center py-4">Yükleniyor...</p>
                ) : categories.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">Kategori bulunamadı.</p>
                ) : (
                    categories.map(cat => (
                        <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
                            {editingId === cat._id ? (
                                <div className="flex-1 flex gap-3 mr-4">
                                    <input
                                        type="text"
                                        className="flex-1 px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleUpdate(cat._id)}
                                        className="text-green-600 hover:text-green-700 p-1"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="text-gray-500 hover:text-gray-700 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">{cat.name}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="text-blue-600 hover:text-blue-700 p-1"
                                            title="Düzenle"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                            title="Sil"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
