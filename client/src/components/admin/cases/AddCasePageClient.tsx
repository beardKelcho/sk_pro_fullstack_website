'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createCase } from '@/services/caseService';
import { getAllProjects } from '@/services/projectService';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';

const EquipmentSelector = dynamic(() => import('@/components/admin/projects/EquipmentSelector'), {
    ssr: false,
    loading: () => (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
            Ekipman secici yukleniyor...
        </div>
    ),
});

export default function AddCase() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        project: '',
        equipment: [] as string[],
        equipmentQuantities: {} as Record<string, number>
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Projeleri yükle
        getAllProjects().then(data => {
            setProjects(data.projects || []);
        }).catch(error => {
            logger.error('Projeler yüklenirken hata:', error);
            toast.error('Projeler yüklenirken bir hata oluştu');
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleEquipmentChange = (selectedIds: string[]) => {
        setFormData(prev => ({ ...prev, equipment: selectedIds }));

        // Set default quantity 1 for newly added items
        const newQuantities = { ...formData.equipmentQuantities };
        selectedIds.forEach(id => {
            if (!newQuantities[id]) {
                newQuantities[id] = 1;
            }
        });

        setFormData(prev => ({ ...prev, equipmentQuantities: newQuantities }));
        if (errors.equipment) setErrors(prev => ({ ...prev, equipment: '' }));
    };

    const handleQuantityChange = (equipmentId: string, quantity: number) => {
        setFormData(prev => ({
            ...prev,
            equipmentQuantities: {
                ...prev.equipmentQuantities,
                [equipmentId]: quantity
            }
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Kasa adı zorunludur';
        if (formData.equipment.length === 0) newErrors.equipment = 'En az bir ekipman seçmelisiniz';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const items = formData.equipment.map(eqId => ({
                equipment: eqId,
                quantity: formData.equipmentQuantities[eqId] || 1
            }));

            await createCase({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                project: formData.project || undefined,
                items
            });

            toast.success('Kasa başarıyla oluşturuldu!');
            router.push('/admin/cases');
        } catch (error: any) {
            logger.error('Kasa oluşturma hatası:', error);
            const msg = error.response?.data?.message || 'Kasa oluşturulurken bir hata oluştu';
            toast.error(msg);
            setErrors({ submit: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Kasa Ekle</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Projeye atanmak üzere hazır ekipman kasası oluşturun.
                    </p>
                </div>
            </div>

            {errors.submit && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    <p>{errors.submit}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Kasa Adı */}
                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kasa Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm`}
                                placeholder="Örn: Kamera Seti A"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Proje */}
                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                İlgili Proje (Opsiyonel)
                            </label>
                            <select
                                id="project"
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 sm:text-sm"
                            >
                                <option value="">Proje Seçin</option>
                                {projects.map(p => (
                                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Kasa Açıklaması */}
                        <div className="col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Açıklama / Notlar
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 dark:bg-gray-700 sm:text-sm"
                                placeholder="Kasa içeriği ile ilgili notlar..."
                            />
                        </div>

                        {/* Ekipman - Smart Selector */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kasaya Eklenecek Ekipmanlar <span className="text-red-500">*</span>
                            </label>
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 mb-4">
                                <EquipmentSelector
                                    selectedEquipment={formData.equipment}
                                    onSelectionChange={handleEquipmentChange}
                                />
                            </div>
                            {errors.equipment && <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>}

                            {/* Miktarları Düzenle */}
                            {formData.equipment.length > 0 && (
                                <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ekipman Miktarları</h3>
                                    </div>
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 p-2">
                                        {formData.equipment.map(eqId => (
                                            <li key={eqId} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate w-2/3">Ekipman ID: {eqId}</span>
                                                <div className="flex items-center w-1/3 justify-end">
                                                    <label className="text-xs text-gray-500 mr-2">Adet:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.equipmentQuantities[eqId] || 1}
                                                        onChange={(e) => handleQuantityChange(eqId, parseInt(e.target.value) || 1)}
                                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs text-gray-500 py-2 px-4 italic">Not: Gerçekte &apos;Ekipman ID&apos; yerine ekipman ismi getirilmesi için EquipmentSelector&apos;dan detaylı veri dönmesi sağlanabilir. Bu örnekte ID gösterilmektedir.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <Link href="/admin/cases">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            İptal
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm transition-colors flex items-center ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Oluşturuluyor...' : 'Kasa Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
