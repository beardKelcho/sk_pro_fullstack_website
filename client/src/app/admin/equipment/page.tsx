'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ExportMenu from '@/components/admin/ExportMenu';
import ImportModal from '@/components/admin/ImportModal';
import BulkActions, { BulkAction } from '@/components/admin/BulkActions';
import { toast } from 'react-toastify';
import logger from '@/utils/logger';
import { useEquipment } from '@/hooks/useEquipment';
import { EquipmentStatus } from '@/types/equipment';
import { bulkDelete, bulkUpdateStatus } from '@/services/bulkService';

// Status Label Helpers
const statusLabels: Record<EquipmentStatus, string> = {
  'AVAILABLE': 'Kullanılabilir',
  'IN_USE': 'Kullanımda',
  'MAINTENANCE': 'Bakımda',
  'DAMAGED': 'Arızalı',
  'RETIRED': 'Emekliye Ayrıldı'
};

const statusColors: Record<EquipmentStatus, string> = {
  'AVAILABLE': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  'IN_USE': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'MAINTENANCE': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  'DAMAGED': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  'RETIRED': 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
};

// Category Options (Ideally should be a constant too)
const categories = [
  { value: 'VideoSwitcher', label: 'Video Switcher' },
  { value: 'MediaServer', label: 'Media Server' },
  { value: 'Camera', label: 'Kamera' },
  { value: 'Display', label: 'Ekran/Monitör' },
  { value: 'Audio', label: 'Ses Ekipmanı' },
  { value: 'Lighting', label: 'Işık Ekipmanı' },
  { value: 'Cable', label: 'Kablo' },
  { value: 'Accessory', label: 'Aksesuar' }
];

export default function EquipmentList() {
  const { equipment, loading, error, refresh, removeEquipment, updateStatus } = useEquipment();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);

  // Helper to safely get category label
  const getCategoryLabel = (catVal: string) => {
    const found = categories.find(c => c.value === catVal);
    return found ? found.label : catVal;
  };

  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Filter
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === '' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleDeleteClick = (id: string) => {
    setEquipmentToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;
    const success = await removeEquipment(equipmentToDelete);
    if (success) {
      setShowDeleteModal(false);
      setEquipmentToDelete(null);
    }
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEquipment.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEquipment.map(item => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} ekipmanı silmek istediğinizden emin misiniz?`)) return;

    try {
      const result = await bulkDelete({ resource: 'equipment', ids: selectedIds });
      toast.success(`${result.deletedCount || selectedIds.length} ekipman silindi`);
      setSelectedIds([]);
      refresh();
    } catch (err: unknown) {
      logger.error('Bulk delete error', err);
      toast.error('Toplu silme başarısız');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: EquipmentStatus) => {
    if (selectedIds.length === 0) return;
    try {
      // Note: bulkUpdateStatus might accept string, ensure it matches backend expectation
      await bulkUpdateStatus({ resource: 'equipment', ids: selectedIds, status: newStatus });
      toast.success('Durumlar güncellendi');
      setSelectedIds([]);
      refresh();
    } catch (err: unknown) {
      logger.error('Bulk status error', err);
      toast.error('Toplu güncelleme başarısız');
    }
  };

  const bulkActions: BulkAction[] = [
    { label: 'Kullanılabilir Yap', onClick: () => handleBulkStatusUpdate('AVAILABLE'), variant: 'primary' },
    { label: 'Bakımda Yap', onClick: () => handleBulkStatusUpdate('MAINTENANCE'), variant: 'secondary' },
    { label: 'Seçili Ekipmanları Sil', onClick: handleBulkDelete, variant: 'danger' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ekipman Yönetimi</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Teknik ekipmanları yönetin</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 text-white rounded-md flex items-center"
          >
            Import
          </button>
          <ExportMenu baseEndpoint="/api/export/equipment" baseFilename="equipment" label="Dışa Aktar" />
          <Link href="/admin/equipment/add">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center">
              Yeni Ekipman Ekle
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border p-2 rounded dark:bg-gray-900/50 dark:border-gray-600 dark:text-white"
          aria-label="Ekipman ara"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="border p-2 rounded dark:bg-gray-900/50 dark:border-gray-600 dark:text-white"
          aria-label="Kategori filtrele"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="border p-2 rounded dark:bg-gray-900/50 dark:border-gray-600 dark:text-white"
          aria-label="Durum filtrele"
        >
          <option value="">Tüm Durumlar</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          totalCount={filteredEquipment.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={() => setSelectedIds([])}
          actions={bulkActions}
        />
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">Ekipman bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredEquipment.length && filteredEquipment.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-blue-600"
                      aria-label="Tümünü seç"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Ekipman</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Seri No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEquipment.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 rounded text-blue-600"
                        aria-label={`${item.name} seç`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.model}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.serialNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{getCategoryLabel(item.category)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[item.status as EquipmentStatus] || 'bg-gray-100'}`}>
                        {statusLabels[item.status as EquipmentStatus] || item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-2">
                      <Link href={`/admin/equipment/edit/${item.id}`} className="text-indigo-600 hover:text-indigo-900">Düzenle</Link>
                      <button onClick={() => handleDeleteClick(item.id)} className="text-red-600 hover:text-red-900">Sil</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {importModalOpen && <ImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onSuccess={refresh} type="equipment" title="Ekipman İçe Aktar" />}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Silme Onayı</h3>
            <p>Bu ekipmanı silmek istediğinize emin misiniz?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded">İptal</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}